import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  stock: number;
  stock_level?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
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

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{product.name}</h3>
              <Badge variant="outline" className={getCategoryColor(product.category)}>
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold">
                  Rp {product.price.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-muted-foreground">/{product.unit}</span>
              </div>
              
              <Badge variant="outline" className={getStockColor(product.stock)}>
                Stok: {product.stock}
              </Badge>
            </div>
          </div>
          
          {/* Add Button */}
          <Button
            size="sm"
            variant="outline"
            className="h-10 w-10 p-0 flex-shrink-0 hover:bg-primary hover:text-primary-foreground"
            onClick={() => onAddToCart(product)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}