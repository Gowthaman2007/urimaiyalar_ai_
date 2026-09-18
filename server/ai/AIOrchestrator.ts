import { GoogleGenAI } from '@google/genai';
import { AIResult, BusinessContext } from './AIProvider';
import { BusinessTools } from './tools';
import { UrimaiyalarNluProvider } from './UrimaiyalarNluProvider';
import { db } from '../database/db';
import { AIConversation, AIMessage } from '../types';

let genAIInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!genAIInstance && process.env.GEMINI_API_KEY) {
    try {
      genAIInstance = new GoogleGenAI();
    } catch (err) {
      console.warn('Could not initialize GoogleGenAI client:', err);
    }
  }
  return genAIInstance;
}

export class AIOrchestrator {
  private customNlu: UrimaiyalarNluProvider;

  constructor() {
    this.customNlu = new UrimaiyalarNluProvider();
  }

  public detectLanguage(query: string): 'ta' | 'en' | 'tanglish' {
    const tamilRegex = /[\u0B80-\u0BFF]/;
    if (tamilRegex.test(query)) {
      return 'ta';
    }
    const tanglishKeywords = [
      'inniku', 'indru', 'sales', 'evlo', 'evvalavu', 'panlam', 'pannu', 'irukku', 
      'kammiya', 'kadan', 'kuduthu', 'varavu', 'selavu', 'pathi', 'sollu', 'kudukkanum',
      'vasool', 'yenna', 'ethana', 'muthal', 'laabam', 'kaatu'
    ];
    const words = query.toLowerCase().split(/\s+/);
    if (words.some(w => tanglishKeywords.includes(w))) {
      return 'tanglish';
    }
    return 'en';
  }

  public async processUserMessage(
    query: string,
    context: BusinessContext,
    conversationId?: string
  ): Promise<{ message: AIMessage; conversationId: string }> {
    const now = new Date().toISOString();
    const language = this.detectLanguage(query);

    // 1. Check if custom NLU is requested and active
    const providerPref = process.env.AI_NLU_PROVIDER || 'gemini';
    if (providerPref === 'urimaiyalar') {
      try {
        const customResult = await this.customNlu.understandQuery(query, context);
        return this.saveAndFormatResult(query, customResult, context, conversationId);
      } catch (err) {
        console.log('[AI ORCHESTRATOR] Falling back from custom NLU to primary Gemini orchestrator.');
      }
    }

    // 2. Intent Analysis & Grounded Business Tool Execution
    const qLower = query.toLowerCase();
    const toolCalls: any[] = [];
    let intent = 'GENERAL_QUERY';
    let dataInsight: any = null;
    let groundedContext = '';

    // Check query patterns for business operations:
    // A. Sales queries: "Inniku sales evlo", "Today's sales", "இன்று sales எவ்வளவு?"
    if (
      qLower.includes('sale') || 
      qLower.includes('விற்பனை') || 
      qLower.includes('வியாபாரம்') ||
      qLower.includes('inniku sales') ||
      qLower.includes('today sales')
    ) {
      intent = 'SALES_QUERY';
      const period = qLower.includes('yesterday') || qLower.includes('நேற்று') ? 'yesterday' : 'today';
      const salesData = await BusinessTools.getSalesSummary(context.businessId, period);
      toolCalls.push({ tool: 'getSalesSummary', input: { period }, output: salesData });
      
      dataInsight = {
        type: 'SALES_SUMMARY',
        keyMetric: period === 'yesterday' ? 'நேற்றைய விற்பனை' : 'இன்றைய விற்பனை',
        value: `₹${salesData.totalSales.toLocaleString('en-IN')}`,
        trend: salesData.salesGrowth > 0 ? `+${salesData.salesGrowth}%` : `${salesData.salesGrowth}%`,
        recommendation: salesData.salesGrowth > 0 ? 'சிறப்பான விற்பனை வேகம்!' : 'மாலை விற்பனையை அதிகரிக்க விளம்பரப்படுத்துங்கள்.'
      };

      groundedContext += `\n[DATABASE SALES DATA - PERIOD: ${period}]\n` +
        `Total Sales Amount: ₹${salesData.totalSales}\n` +
        `Transactions: ${salesData.transactionsCount}\n` +
        `Sales Growth vs Previous Period: ${salesData.salesGrowth}%\n` +
        `Today's Sales: ₹${salesData.todaySales}\n`;
    }

    // B. Customer Credit queries: "Ravi oda pending amount evlo?", "Customer credit", "கடன் நிலுவை"
    else if (
      qLower.includes('credit') || 
      qLower.includes('pending') || 
      qLower.includes('கடன்') || 
      qLower.includes('நிலுவை') || 
      qLower.includes('kadan') ||
      qLower.includes('baki')
    ) {
      // Check if a specific customer name is mentioned (Ravi, Kumar, Suresh, Priya, etc.)
      const knownNames = ['ravi', 'kumar', 'suresh', 'priya', 'ரவி', 'குமார்', 'சுரேஷ்', 'பிரியா'];
      const matchedName = knownNames.find(n => qLower.includes(n));

      // Check if adding credit: "Ravi-ku 500 rupees credit add pannu"
      const addMatch = query.match(/(\d+)\s*(?:rupees|rs|ரூபாய்)?\s*(?:credit|கடன்)?\s*(?:add|சேர்|போடு)/i) ||
                         query.match(/(?:add|சேர்|போடு)\s*(?:credit|கடன்)?\s*(?:of)?\s*(\d+)/i);
      
      if (addMatch && matchedName) {
        const amount = parseInt(addMatch[1], 10);
        intent = 'ADD_CREDIT';
        const addResult = await BusinessTools.addCustomerCredit(context.businessId, matchedName, amount, 'Added via voice/chat assistant');
        toolCalls.push({ tool: 'addCustomerCredit', input: { customer: matchedName, amount }, output: addResult });
        groundedContext += `\n[ACTION COMPLETED - ADD CREDIT]\nCustomer: ${addResult.customerName}\nAdded Amount: ₹${amount}\nNew Balance: ₹${addResult.newTotalCredit}\n`;
        
        dataInsight = {
          type: 'CREDIT_ADDED',
          keyMetric: `${addResult.customerName} நிலுவை`,
          value: `₹${addResult.newTotalCredit.toLocaleString('en-IN')}`,
          recommendation: 'கடன் விவரம் கணக்கு ஏட்டில் பதிவு செய்யப்பட்டது.'
        };
      } else if (matchedName) {
        intent = 'CUSTOMER_CREDIT_QUERY';
        const creditData = await BusinessTools.getCustomerCredit(context.businessId, matchedName);
        toolCalls.push({ tool: 'getCustomerCredit', input: { customer: matchedName }, output: creditData });
        
        if (creditData.found) {
          groundedContext += `\n[DATABASE CUSTOMER CREDIT DATA]\n` +
            `Customer: ${creditData.customerName}\n` +
            `Phone: ${creditData.phone}\n` +
            `Outstanding Credit: ₹${creditData.outstandingCredit}\n` +
            `Total Purchases: ₹${creditData.totalPurchases}\n` +
            `Total Paid: ₹${creditData.totalPaid}\n`;

          dataInsight = {
            type: 'CUSTOMER_LEDGER',
            keyMetric: `${creditData.customerName} நிலுவை`,
            value: `₹${creditData.outstandingCredit?.toLocaleString('en-IN')}`,
            trend: creditData.outstandingCredit && creditData.outstandingCredit > 1500 ? 'அதிக நிலுவை' : 'சாதாரண வரம்பு',
            recommendation: creditData.outstandingCredit && creditData.outstandingCredit > 1000 ? 'வாடிக்கையாளருக்கு வாட்ஸ்அப் அல்லது தொலைபேசி நினைவூட்டல் அனுப்பலாம்.' : 'கடன் வரம்பிற்குள் உள்ளது.'
          };
        } else {
          groundedContext += `\nCustomer ${matchedName} not found in database.\n`;
        }
      } else {
        // General ledger summary
        intent = 'GENERAL_CREDIT_QUERY';
        const bizSummary = await BusinessTools.getBusinessSummary(context.businessId);
        toolCalls.push({ tool: 'getBusinessSummary', input: {}, output: bizSummary });
        groundedContext += `\n[TOTAL RECEIVABLES / PAYABLES]\nTotal Customer Receivables: ₹${bizSummary.totalReceivables}\nTotal Supplier Payables: ₹${bizSummary.totalPayables}\n`;
        dataInsight = {
          type: 'CREDIT_SUMMARY',
          keyMetric: 'மொத்த கடன் நிலுவை (வரவு)',
          value: `₹${bizSummary.totalReceivables.toLocaleString('en-IN')}`,
          recommendation: 'வார இறுதிக்குள் வாடிக்கையாளர் நிலுவைத் தொகையை வசூலிக்கவும்.'
        };
      }
    }

    // C. Low stock & Inventory queries: "Enna stock kammiya irukku?", "Low stock", "சரக்கு இருப்பு"
    else if (
      qLower.includes('stock') || 
      qLower.includes('இருப்பு') || 
      qLower.includes('சரக்கு') || 
      qLower.includes('kammi') ||
      qLower.includes('குறைவாக') ||
      qLower.includes('inventory')
    ) {
      intent = 'LOW_STOCK_QUERY';
      const stockData = await BusinessTools.getLowStock(context.businessId);
      toolCalls.push({ tool: 'getLowStock', input: {}, output: stockData });
      
      groundedContext += `\n[DATABASE LOW STOCK PRODUCTS (${stockData.count} items)]\n` +
        stockData.items.map(i => `- ${i.name} (${i.tamilName || ''}): Current stock ${i.currentStock} ${i.unit}, Minimum required: ${i.minimumStock}, Supplier: ${i.supplier || 'N/A'}`).join('\n') + '\n';

      dataInsight = {
        type: 'INVENTORY_ALERT',
        keyMetric: 'குறைந்த இருப்பு பொருட்கள்',
        value: `${stockData.count} பொருட்கள்`,
        recommendation: stockData.items.length > 0 ? `${stockData.items[0].name} உடனே சப்ளையரிடம் ஆர்டர் செய்யவும்.` : 'அனைத்துப் பொருட்களும் போதுமான அளவில் உள்ளன.'
      };
    }

    // D. Government schemes queries: "scheme", "திட்டம்", "mudra", "needs", "uyegp", "loan", "மானியம்"
    else if (
      qLower.includes('scheme') || 
      qLower.includes('திட்டம்') || 
      qLower.includes('mudra') || 
      qLower.includes('needs') || 
      qLower.includes('uyegp') || 
      qLower.includes('மானியம்') ||
      qLower.includes('subsidy') ||
      qLower.includes('loan')
    ) {
      intent = 'SCHEME_QUERY';
      const schemeData = await BusinessTools.searchGovernmentSchemes(query, context.category);
      toolCalls.push({ tool: 'searchGovernmentSchemes', input: { query }, output: schemeData });
      
      groundedContext += `\n[GOVERNMENT SCHEMES INFORMATION (${schemeData.foundCount} schemes)]\n` +
        schemeData.schemes.map(s => `Scheme: ${s.name} (${s.tamilName})\nMax Assistance: ${s.maxAmount}\nType: ${s.subsidyOrLoan}\nEligibility: ${s.eligibilityTamil}\nPortal: ${s.portalUrl}`).join('\n\n') + '\n';

      dataInsight = {
        type: 'GOVERNMENT_SCHEME',
        keyMetric: 'கிடைக்கும் அரசு திட்டங்கள்',
        value: `${schemeData.foundCount} திட்டங்கள்`,
        recommendation: 'அரசு மானியத் திட்டங்களுக்கு Udyam பதிவு மற்றும் திட்ட அறிக்கை (DPR) அவசியம்.'
      };
    }

    // E. General business advice & improvements: "Business improve panna enna panlam?"
    else if (
      qLower.includes('improve') || 
      qLower.includes('வளர்ச்சி') || 
      qLower.includes('panlam') || 
      qLower.includes('முன்னேற') ||
      qLower.includes('profit') ||
      qLower.includes('லாபம்')
    ) {
      intent = 'BUSINESS_ADVICE';
      const summary = await BusinessTools.getBusinessSummary(context.businessId);
      toolCalls.push({ tool: 'getBusinessSummary', input: {}, output: summary });

      groundedContext += `\n[CURRENT BUSINESS FINANCIAL SNAPSHOT]\n` +
        `Today's Sales: ₹${summary.todaySales}\n` +
        `Today's Expenses: ₹${summary.todayExpenses}\n` +
        `Customer Receivables: ₹${summary.totalReceivables}\n` +
        `Supplier Payables: ₹${summary.totalPayables}\n` +
        `Inventory Valuation: ₹${summary.inventoryValue}\n` +
        `Low Stock Items Count: ${summary.lowStockCount}\n` +
        `AI Deterministic Insights: ${summary.tamilInsights.join(' | ')}\n`;

      dataInsight = {
        type: 'BUSINESS_ADVICE',
        keyMetric: 'வணிக ஆரோக்கியம்',
        value: summary.todaySales > summary.todayExpenses ? 'நேர்மறை லாபம்' : 'கவனம் தேவை',
        recommendation: 'சரக்கு கையிருப்பை சீரமைத்து, வாடிக்கையாளர் நிலுவைத் தொகையை விரைவாக வசூலிக்கவும்.'
      };
    }

    // 3. Generate Natural Language Response using Gemini or Deterministic Fallback
    let replyText = '';
    const gemini = getGeminiClient();

    if (gemini) {
      try {
        const systemPrompt = `You are URIMAIYALAR AI (உரிமையாளர் AI), a wise, helpful, Tamil-first AI Business Intelligence Companion for micro and small enterprises in Tamil Nadu.
Business Name: ${context.businessName}
Owner Name: ${context.ownerName}
Category: ${context.category}
Currency: ${context.currency}

STRICT DATA GROUNDING RULES:
1. All financial numbers, balances, sales amounts, and inventory quantities MUST STRICTLY originate from the provided DATABASE CONTEXT below.
2. NEVER invent, extrapolate, or hallucinate financial numbers or customer balances. If no data exists, clearly state it in Tamil/English.
3. Language format:
   - If the user wrote in Tamil (தமிழ்), reply primarily in crisp, respectful, polite Tamil.
   - If the user wrote in Tanglish (e.g. "Inniku sales evlo?"), reply in fluent, easy-to-read Tamil / Tanglish / English mix that local Tamil business owners appreciate.
   - If the user wrote in English, reply in professional English with Tamil context.
4. Structure the response clearly with:
   - Direct answer with formatted numbers (e.g. ₹8,500).
   - Brief analysis or context.
   - Actionable recommendation (பரிந்துரை).

GROUNDED DATABASE CONTEXT:
${groundedContext || 'No specific database query was triggered. Respond politely as Urimaiyalar AI.'}
`;

        const response = await gemini.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question: "${query}"` }]
            }
          ]
        });

        replyText = response.text?.trim() || '';
      } catch (err: any) {
        console.warn('[GEMINI AI ERROR] Calling Gemini failed, falling back to deterministic response engine:', err.message);
      }
    }

    // Fallback deterministic response generator if Gemini was offline/unavailable
    if (!replyText) {
      replyText = this.generateDeterministicResponse(intent, query, toolCalls, language, context);
    }

    const aiResult: AIResult = {
      intent,
      confidence: 0.98,
      language,
      text: replyText,
      toolCalls,
      dataInsight
    };

    return this.saveAndFormatResult(query, aiResult, context, conversationId);
  }

  private generateDeterministicResponse(
    intent: string,
    query: string,
    toolCalls: any[],
    language: 'ta' | 'en' | 'tanglish',
    context: BusinessContext
  ): string {
    const isTamil = language === 'ta' || language === 'tanglish';

    if (intent === 'SALES_QUERY') {
      const tool = toolCalls.find(t => t.tool === 'getSalesSummary');
      if (tool) {
        const d = tool.output;
        if (isTamil) {
          return `இன்றைய மொத்த விற்பனை: ₹${d.totalSales.toLocaleString('en-IN')}\n\n` +
            `• பதிவு செய்யப்பட்ட பில்கள்: ${d.transactionsCount}\n` +
            `• விற்பனை வளர்ச்சி: ${d.salesGrowth > 0 ? `+${d.salesGrowth}% (முந்தைய காலத்தை விட அதிகம்)` : `${d.salesGrowth}%`}\n\n` +
            `பரிந்துரை: மாலை நேர வியாபாரத்திற்கு முக்கிய உணவுப் பொருட்களின் இருப்பை உறுதி செய்யவும்.`;
        } else {
          return `Today's Total Sales: ₹${d.totalSales.toLocaleString('en-IN')}\n\n` +
            `• Total Invoices: ${d.transactionsCount}\n` +
            `• Growth vs Previous Period: ${d.salesGrowth}%\n\n` +
            `Recommendation: Verify stock for peak evening hours to maximize turnover.`;
        }
      }
    }

    if (intent === 'CUSTOMER_CREDIT_QUERY') {
      const tool = toolCalls.find(t => t.tool === 'getCustomerCredit');
      if (tool && tool.output.found) {
        const c = tool.output;
        if (isTamil) {
          return `வாடிக்கையாளர் ${c.customerName} அவர்களின் கணக்கு விவரம்:\n\n` +
            `• நடப்பு கடன் நிலுவைத் தொகை: ₹${c.outstandingCredit.toLocaleString('en-IN')}\n` +
            `• மொத்த கொள்முதல்: ₹${c.totalPurchases.toLocaleString('en-IN')}\n` +
            `• செலுத்திய தொகை: ₹${c.totalPaid.toLocaleString('en-IN')}\n\n` +
            (c.outstandingCredit > 1000 ? `பரிந்துரை: வார இறுதி கணக்கு முடிக்கும் முன் வரவு நினைவூட்டல் அனுப்பலாம்.` : `வாடிக்கையாளரின் கணக்கு நல்ல நிலையில் உள்ளது.`);
        } else {
          return `Customer Statement for ${c.customerName}:\n\n` +
            `• Current Outstanding Credit: ₹${c.outstandingCredit.toLocaleString('en-IN')}\n` +
            `• Lifetime Purchases: ₹${c.totalPurchases.toLocaleString('en-IN')}\n` +
            `• Total Paid: ₹${c.totalPaid.toLocaleString('en-IN')}\n\n` +
            `Status: ${c.outstandingCredit > 1000 ? 'Payment reminder recommended.' : 'Account in good standing.'}`;
        }
      }
    }

    if (intent === 'ADD_CREDIT') {
      const tool = toolCalls.find(t => t.tool === 'addCustomerCredit');
      if (tool) {
        const a = tool.output;
        if (isTamil) {
          return `வாடிக்கையாளர் ${a.customerName}-க்கு ₹${a.amountAdded} கடன் வெற்றிகரமாக சேர்க்கப்பட்டது.\n\n` +
            `புதிய மொத்த நிலுவைத் தொகை: ₹${a.newTotalCredit.toLocaleString('en-IN')}.`;
        } else {
          return `Successfully added ₹${a.amountAdded} credit for ${a.customerName}.\n\n` +
            `Updated Outstanding Balance: ₹${a.newTotalCredit.toLocaleString('en-IN')}.`;
        }
      }
    }

    if (intent === 'LOW_STOCK_QUERY') {
      const tool = toolCalls.find(t => t.tool === 'getLowStock');
      if (tool) {
        const s = tool.output;
        if (s.items.length === 0) {
          return isTamil ? 'அனைத்துப் பொருட்களும் போதுமான கையிருப்பில் உள்ளன.' : 'All inventory items are currently at safe stock levels.';
        }
        if (isTamil) {
          return `கையிருப்பு குறைவாக உள்ள பொருட்கள் (${s.count}):\n\n` +
            s.items.map((i: any) => `• ${i.tamilName || i.name}: தற்போது ${i.currentStock} ${i.unit} (குறைந்தபட்ச தேவை: ${i.minimumStock})`).join('\n') +
            `\n\nபரிந்துரை: பற்றாக்குறை ஏற்படுவதற்கு முன் சப்ளையரிடம் உடனே புதிய ஆர்டர் பதிவு செய்யவும்.`;
        } else {
          return `Low Stock Alert (${s.count} items):\n\n` +
            s.items.map((i: any) => `• ${i.name}: ${i.currentStock} ${i.unit} in stock (Min required: ${i.minimumStock})`).join('\n') +
            `\n\nRecommendation: Place purchase reorders immediately to avoid running out of stock.`;
        }
      }
    }

    if (intent === 'BUSINESS_ADVICE') {
      const tool = toolCalls.find(t => t.tool === 'getBusinessSummary');
      const d = tool?.output;
      if (isTamil) {
        return `உங்கள் வணிகத்தின் இன்றைய நிலவரம் & ஆலோசனைகள்:\n\n` +
          `1. இன்றைய விற்பனை: ₹${d?.todaySales?.toLocaleString('en-IN') || 0}\n` +
          `2. வாடிக்கையாளர் வரவு வைக்க வேண்டிய கடன்: ₹${d?.totalReceivables?.toLocaleString('en-IN') || 0}\n` +
          `3. சப்ளையர்களுக்கு செலுத்த வேண்டிய தொகை: ₹${d?.totalPayables?.toLocaleString('en-IN') || 0}\n\n` +
          `முக்கிய ஆலோசனைகள்:\n` +
          `• அதிக லாபம் தரும் பொருட்களுக்கு முன்னுரிமை கொடுங்கள்.\n` +
          `• கடன் தொகையை வாரந்தோறும் வசூலித்து மூலதன சுழற்சியை வேகமாக வையுங்கள்.\n` +
          `• இருப்பு குறைந்துள்ள பொருட்களை உடனே வாங்கி வைக்கவும்.`;
      } else {
        return `Business Intelligence Review:\n\n` +
          `1. Today's Turnover: ₹${d?.todaySales?.toLocaleString('en-IN') || 0}\n` +
          `2. Customer Receivables: ₹${d?.totalReceivables?.toLocaleString('en-IN') || 0}\n` +
          `3. Supplier Payables: ₹${d?.totalPayables?.toLocaleString('en-IN') || 0}\n\n` +
          `Strategic Priorities:\n` +
          `• Speed up receivables collection cycle.\n` +
          `• Restock low-inventory high-margin staples.\n` +
          `• Maintain healthy cash liquidity for supplier discounts.`;
      }
    }

    return isTamil 
      ? `வணக்கம்! நான் உரிமையாளர் AI. இன்றைய விற்பனை, கடன் நிலுவை, சரக்கு இருப்பு, அரசு திட்டங்கள் குறித்து என்னிடம் கேட்கலாம்.`
      : `Hello! I am URIMAIYALAR AI. You can ask me about today's sales, customer ledger, inventory levels, or government schemes.`;
  }

  private saveAndFormatResult(
    userQuery: string,
    result: AIResult,
    context: BusinessContext,
    conversationId?: string
  ): { message: AIMessage; conversationId: string } {
    const now = new Date().toISOString();
    let conv = conversationId ? db.aiConversations.find(c => c.id === conversationId && c.businessId === context.businessId) : null;

    if (!conv) {
      conv = {
        id: `conv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId: context.businessId,
        userId: 'user-active',
        title: userQuery.slice(0, 35),
        messages: [],
        createdAt: now,
        updatedAt: now
      };
      db.saveConversation(conv);
    }

    // Save user message
    const userMsg: AIMessage = {
      id: `msg-${Date.now()}-u`,
      conversationId: conv.id,
      sender: 'USER',
      text: userQuery,
      createdAt: now
    };
    conv.messages.push(userMsg);

    // Save assistant message
    const assistantMsg: AIMessage = {
      id: `msg-${Date.now()}-a`,
      conversationId: conv.id,
      sender: 'ASSISTANT',
      text: result.text,
      intent: result.intent,
      toolCalls: result.toolCalls,
      dataInsight: result.dataInsight,
      createdAt: new Date(Date.now() + 200).toISOString()
    };
    conv.messages.push(assistantMsg);
    conv.updatedAt = now;
    db.saveConversation(conv);

    return {
      message: assistantMsg,
      conversationId: conv.id
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();
