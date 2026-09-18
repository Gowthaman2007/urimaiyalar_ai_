import { IAIProvider, AIResult, BusinessContext } from './AIProvider';
import { BusinessTools } from './tools';

export class UrimaiyalarNluProvider implements IAIProvider {
  public name = 'urimaiyalar-custom-nlu';
  private endpointUrl: string;

  constructor(endpointUrl: string = process.env.URIMAIYALAR_NLU_URL || 'http://localhost:8000') {
    this.endpointUrl = endpointUrl;
  }

  public async understandQuery(query: string, context: BusinessContext): Promise<AIResult> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500); // 2.5s fast timeout

      const response = await fetch(`${this.endpointUrl}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Custom NLU endpoint returned status ${response.status}`);
      }

      const data = await response.json();
      const intent = data.intent;
      const entities = data.entities || {};
      const confidence = data.confidence || 0.95;

      // Map intent to deterministic tool calls
      const toolCalls: any[] = [];
      let replyText = '';

      if (intent === 'CUSTOMER_CREDIT_QUERY' && entities.customer) {
        const creditData = await BusinessTools.getCustomerCredit(context.businessId, entities.customer);
        toolCalls.push({ tool: 'getCustomerCredit', input: { customer: entities.customer }, output: creditData });
        if (creditData.found) {
          replyText = `வாடிக்கையாளர் ${creditData.customerName} அவர்களின் நிலுவைத் தொகை (Pending Credit): ₹${creditData.outstandingCredit?.toLocaleString('en-IN')}.\nமொத்த கொள்முதல்: ₹${creditData.totalPurchases?.toLocaleString('en-IN')}.`;
        } else {
          replyText = `வாடிக்கையாளர் "${entities.customer}" பற்றிய கணக்கு விவரங்கள் கிடைக்கவில்லை.`;
        }
      } else if (intent === 'SALES_QUERY') {
        const salesData = await BusinessTools.getSalesSummary(context.businessId, 'today');
        toolCalls.push({ tool: 'getSalesSummary', input: { period: 'today' }, output: salesData });
        replyText = `இன்றைய மொத்த விற்பனை: ₹${salesData.totalSales.toLocaleString('en-IN')}.\nபதிவு செய்யப்பட்ட பில்கள்: ${salesData.transactionsCount}.`;
      } else if (intent === 'LOW_STOCK_QUERY') {
        const stockData = await BusinessTools.getLowStock(context.businessId);
        toolCalls.push({ tool: 'getLowStock', input: {}, output: stockData });
        replyText = `கையிருப்பு குறைவாக உள்ள பொருட்கள் (${stockData.count}):\n` + 
          stockData.items.map(i => `• ${i.tamilName || i.name}: ${i.currentStock} ${i.unit} (குறைந்தபட்ச தேவை: ${i.minimumStock})`).join('\n');
      } else {
        replyText = `தங்களின் கோரிக்கை (${intent}) புரிந்து கொள்ளப்பட்டது.`;
      }

      return {
        intent,
        confidence,
        entities,
        language: 'ta',
        text: replyText,
        toolCalls
      };
    } catch (err: any) {
      console.warn('[URIMAIYALAR NLU] Custom model endpoint unavailable or failed:', err.message);
      throw err; // Allow fallback to Gemini
    }
  }
}
