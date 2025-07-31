import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';
import Cart from '@/components/Cart';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  stock: number;
  stock_level?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
}

const categories = [
  { id: 'all', name: 'Semua', color: 'bg-muted text-muted-foreground' },
  { id: 'literan', name: 'Literan', color: 'bg-transfer text-transfer-foreground' },
  { id: 'kiloan', name: 'Kiloan', color: 'bg-success text-success-foreground' },
  { id: 'karungan', name: 'Karungan', color: 'bg-qris text-qris-foreground' },
];

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { signOut, user } = useAuth();
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
        .order('name');

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
        p.price.toString().includes(searchQuery) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 0.5 }
            : item
        );
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          quantity: 0.5
        }];
      }
    });
    setSearchQuery('');
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { cart } });
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setCart([]);
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal logout",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b z-40 p-3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">POS Toko Beras</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/products')}>
                Daftar Produk
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/history')}>
                Riwayat Penjualan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-change">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk atau harga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

      </div>

      {/* Content */}
      <div className="p-3">
        {!searchQuery ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Gunakan pencarian untuk menemukan produk</p>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="grid grid-cols-1 gap-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Tidak ada produk ditemukan</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart */}
      <Cart
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}