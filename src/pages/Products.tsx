import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  stock: number;
  description?: string;
}

const getStockColor = (stock: number) => {
  if (stock > 20) return 'bg-success text-success-foreground';
  if (stock >= 10) return 'bg-warning text-warning-foreground';
  return 'bg-change text-change-foreground';
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'literan': return 'bg-transfer text-transfer-foreground';
    case 'kiloan': return 'bg-success text-success-foreground';
    case 'karungan': return 'bg-qris text-qris-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat produk",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.price.toString().includes(searchQuery)
      );
    }

    setFilteredProducts(filtered);
  };

  const groupedProducts = filteredProducts.reduce((groups, product) => {
    const category = product.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {} as Record<string, Product[]>);

  const lowStockProducts = products.filter(p => p.stock <= 10);

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <h1 className="text-xl font-bold ml-4">Daftar Produk</h1>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari produk, kategori, atau harga..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{products.length}</div>
            <div className="text-sm text-muted-foreground">Total Produk</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-change">{lowStockProducts.length}</div>
            <div className="text-sm text-muted-foreground">Stok Rendah</div>
          </CardContent>
        </Card>
      </div>

      {/* Products */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
            <div key={category}>
              <div className="flex items-center mb-3">
                <Badge className={getCategoryColor(category)}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
                <span className="ml-2 text-sm text-muted-foreground">
                  {categoryProducts.length} produk
                </span>
              </div>
              
              <div className="space-y-3">
                {categoryProducts.map(product => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-muted-foreground">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className={getStockColor(product.stock)}>
                          {product.stock}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold">
                          Rp {product.price.toLocaleString('id-ID')}
                          <span className="text-sm font-normal text-muted-foreground">
                            /{product.unit}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Tidak ada produk ditemukan</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}