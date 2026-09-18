import React, { useState, useEffect } from 'react';
import { Boxes, Plus, Search, AlertTriangle, ArrowUpDown, History } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';

export const InventoryView: React.FC = () => {
  const { language, t, isEnglish, isTanglish } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState<boolean>(false);

  // Add Product Modal
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [tamilName, setTamilName] = useState<string>('');
  const [sku, setSku] = useState<string>('');
  const [category, setCategory] = useState<string>('மளிகை (Grocery)');
  const [unit, setUnit] = useState<string>('kg');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minimumStock, setMinimumStock] = useState<number>(5);
  const [supplierName, setSupplierName] = useState<string>('');

  // Stock Adjust Modal
  const [isAdjustOpen, setIsAdjustOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<'ADJUSTMENT' | 'DAMAGE' | 'RETURN'>('ADJUSTMENT');
  const [adjustNewStock, setAdjustNewStock] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(Array.isArray(data) ? data : (data?.products || []));
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    try {
      await api.createProduct({
        name,
        tamilName,
        sku,
        category,
        unit,
        sellingPrice,
        purchasePrice,
        currentStock,
        minimumStock,
        supplierName,
      });

      setName('');
      setTamilName('');
      setSku('');
      setSellingPrice(0);
      setPurchasePrice(0);
      setCurrentStock(0);
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'பொருள் சேர்க்க முடியவில்லை');
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await api.adjustStock({
        productId: selectedProduct.id,
        newStock: adjustNewStock,
        type: adjustType,
        reason: adjustReason || 'இருப்பு சரிசெய்தல்',
      });
      setIsAdjustOpen(false);
      setSelectedProduct(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'இருப்பு சரிசெய்ய முடியவில்லை');
    }
  };

  const openAdjust = (prod: Product) => {
    setSelectedProduct(prod);
    setAdjustNewStock(prod.currentStock);
    setAdjustReason('');
    setIsAdjustOpen(true);
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const filtered = safeProducts.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.tamilName && p.tamilName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = !filterLowStockOnly || p.currentStock <= p.minimumStock;
    return matchesSearch && matchesLowStock;
  });

  const totalStockValuation = safeProducts.reduce((sum, p) => sum + p.currentStock * p.purchasePrice, 0);
  const lowStockCount = safeProducts.filter((p) => p.currentStock <= p.minimumStock).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isEnglish ? 'Inventory Management' : isTanglish ? 'Inventory Stock' : 'சரக்கு இருப்பு மேலாண்மை'}</span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-sm font-normal">
              {isEnglish ? 'Stock Catalog' : 'Inventory Stock'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEnglish
              ? 'Product list, low stock triggers, and quantity audits'
              : isTanglish
              ? 'Item list, low stock alerts, and stock adjustments'
              : 'பொருட்கள் பட்டியல், குறைந்த இருப்பு எச்சரிக்கைகள் மற்றும் இருப்பு திருத்தம்'}
          </p>
        </div>

        <button
          id="inventory-add-product-btn"
          onClick={() => {
            setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
            setIsAddOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {isEnglish ? 'Add Product' : isTanglish ? 'Add Product' : 'புதிய பொருள் சேர்க்க (Add Product)'}
        </button>
      </div>

      {/* Quick Stat Pill Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">
              {isEnglish ? 'Total Stock Valuation' : isTanglish ? 'Total Stock Value' : 'மொத்த சரக்கு மதிப்பு'}
            </p>
            <p className="text-lg font-extrabold text-slate-900">
              ₹{totalStockValuation.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase">
              {isEnglish ? 'Registered Products' : isTanglish ? 'Catalog Products' : 'பதிவு செய்யப்பட்ட பொருட்கள்'}
            </p>
            <p className="text-lg font-extrabold text-slate-900">
              {products.length} {isEnglish ? 'products' : 'பொருட்கள்'}
            </p>
          </div>
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
          className={`p-3.5 rounded-2xl border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            filterLowStockOnly
              ? 'bg-amber-100 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-slate-200/80 hover:bg-amber-50/50'
          }`}
        >
          <div>
            <p className="text-[11px] font-bold text-amber-800 uppercase">
              {isEnglish ? 'Low Stock Alerts' : isTanglish ? 'Low Stock Alert' : 'குறைந்த இருப்பு எச்சரிக்கை'}
            </p>
            <p className="text-lg font-extrabold text-amber-700">
              {lowStockCount} {isEnglish ? 'items' : 'பொருட்கள்'}
            </p>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex-1 flex items-center gap-2 w-full">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            id="inventory-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isEnglish
                ? 'Search product name, Tamil name, or SKU...'
                : isTanglish
                ? 'Search product name or SKU...'
                : 'பொருளின் பெயர் (தமிழ்/English) அல்லது SKU மூலம் தேடுக...'
            }
            className="flex-1 bg-transparent text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterLowStockOnly(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              !filterLowStockOnly ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isEnglish ? 'All' : 'அனைத்தும்'} ({products.length})
          </button>
          <button
            onClick={() => setFilterLowStockOnly(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 ${
              filterLowStockOnly
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {isEnglish ? 'Low Stock Only' : 'குறைவு மட்டும்'} ({lowStockCount})
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-3.5 pl-5">{isEnglish ? 'Product Name' : 'பொருள் பெயர் (Product)'}</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">{isEnglish ? 'Category' : 'பிரிவு (Category)'}</th>
                <th className="p-3.5 text-right">{isEnglish ? 'Cost' : 'அடக்கம் (Cost)'}</th>
                <th className="p-3.5 text-right">{isEnglish ? 'Selling Price' : 'விற்பனை விலை'}</th>
                <th className="p-3.5 text-center">{isEnglish ? 'Stock Level' : 'கையிருப்பு (Stock)'}</th>
                <th className="p-3.5 text-right pr-5">{isEnglish ? 'Action' : 'செயல்கள் (Action)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((p) => {
                const isLow = p.currentStock <= p.minimumStock;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5">
                      <p className="font-bold text-slate-900 text-xs">
                        {isEnglish
                          ? p.name
                          : p.tamilName
                          ? `${p.tamilName} (${p.name})`
                          : p.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {isEnglish ? 'Unit' : 'அளவு அலகு'}: {p.unit}
                      </p>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{p.sku}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-medium text-slate-600">
                      ₹{p.purchasePrice}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-emerald-800">
                      ₹{p.sellingPrice}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          isLow
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {isLow && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {p.currentStock} {p.unit}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {isEnglish ? 'Min' : 'குறைந்தது'}: {p.minimumStock}
                      </p>
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <button
                        onClick={() => openAdjust(p)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                        {isEnglish ? 'Adjust' : isTanglish ? 'Adjust Stock' : 'இருப்பு திருத்து'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={
          isEnglish
            ? 'Add New Product'
            : isTanglish
            ? 'Add New Product'
            : 'புதிய பொருள் சேர்க்க (Add New Product)'
        }
        subtitle={
          isEnglish
            ? 'Enter item specs, purchase price, and selling margin.'
            : isTanglish
            ? 'Enter item details, cost price, and selling price.'
            : 'சரக்கு விவரங்கள், அடக்க விலை மற்றும் விற்பனை விலையை உள்ளிடவும்.'
        }
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddProduct} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Product Name (English) *' : 'பொருள் பெயர் (English) *'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Ponni Rice"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Tamil Name' : 'தமிழ் பெயர் (Tamil Name)'}
              </label>
              <input
                type="text"
                value={tamilName}
                onChange={(e) => setTamilName(e.target.value)}
                placeholder={isEnglish ? 'Ex: பொன்னி அரிசி' : 'உதாரணம்: பொன்னி அரிசி'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'SKU Code *' : 'SKU குறியீடு *'}
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Category' : 'பிரிவு (Category)'}
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Unit' : 'அளவு அலகு (Unit)'}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <option value="kg">{isEnglish ? 'Kilogram (kg)' : 'கிலோ (kg)'}</option>
                <option value="litre">{isEnglish ? 'Litre (litre)' : 'லிட்டர் (litre)'}</option>
                <option value="piece">{isEnglish ? 'Piece (piece)' : 'எண்ணிக்கை (piece)'}</option>
                <option value="packet">{isEnglish ? 'Packet (packet)' : 'பாக்கெட் (packet)'}</option>
                <option value="box">{isEnglish ? 'Box (box)' : 'பெட்டி (box)'}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Purchase Cost (₹) *' : 'அடக்க விலை (Purchase Cost ₹) *'}
              </label>
              <input
                type="number"
                min="0"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Selling Price (₹) *' : 'விற்பனை விலை (Selling Price ₹) *'}
              </label>
              <input
                type="number"
                min="0"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Initial Stock' : 'ஆரம்ப கையிருப்பு (Initial Stock)'}
              </label>
              <input
                type="number"
                min="0"
                value={currentStock}
                onChange={(e) => setCurrentStock(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Min Alert Stock' : 'குறைந்தபட்ச தேவை (Min Alert Stock)'}
              </label>
              <input
                type="number"
                min="1"
                value={minimumStock}
                onChange={(e) => setMinimumStock(parseFloat(e.target.value) || 5)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              {isEnglish ? 'Cancel' : 'ரத்து'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
            >
              {isEnglish ? 'Save Product' : 'பொருள் சேமி (Save Product)'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title={
          isEnglish
            ? `Stock Adjustment: ${selectedProduct?.name}`
            : `இருப்பு திருத்தம்: ${selectedProduct?.tamilName || selectedProduct?.name}`
        }
        subtitle={
          isEnglish
            ? `Current Stock: ${selectedProduct?.currentStock} ${selectedProduct?.unit}`
            : `தற்போதைய கையிருப்பு: ${selectedProduct?.currentStock} ${selectedProduct?.unit}`
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAdjustStock} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Adjustment Type' : 'திருத்த வகை'}
            </label>
            <select
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            >
              <option value="ADJUSTMENT">{isEnglish ? 'Audit Count Adjustment' : 'நேரடி சரிசெய்தல் (Audit Count)'}</option>
              <option value="DAMAGE">{isEnglish ? 'Damaged Stock' : 'சேதமடைந்த பொருள் கழிவு (Damage)'}</option>
              <option value="RETURN">{isEnglish ? 'Customer Return' : 'வாடிக்கையாளர் திருப்பியது (Return)'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish
                ? `New Stock Count (${selectedProduct?.unit})`
                : `புதிய சரியான கையிருப்பு அளவு (${selectedProduct?.unit})`}
            </label>
            <input
              type="number"
              min="0"
              value={adjustNewStock}
              onChange={(e) => setAdjustNewStock(parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Reason' : 'காரணம் (Reason)'}
            </label>
            <input
              type="text"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder={isEnglish ? 'Ex: Weekly stock audit...' : 'எ.கா: வாராந்திர சரக்கு தணிக்கை...'}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdjustOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              {isEnglish ? 'Cancel' : 'ரத்து'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              {isEnglish ? 'Confirm Adjustment' : 'சரிசெய் (Confirm Adjustment)'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
