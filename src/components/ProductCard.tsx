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
  return 'bg-muted text-muted-foreground';
};

const getCategoryColor = (category: string) => {
  return 'bg-muted text-muted-foreground';
};

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Card 
      className="border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-muted/50 active:bg-muted" 
      onClick={() => onAddToCart(product)}
    >
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
        </div>
      </CardContent>
    </Card>
  );
}