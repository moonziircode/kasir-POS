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
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
          <Button
            size="sm"
            variant="outline"
            className="ml-2 h-8 w-8 p-0 flex-shrink-0"
            onClick={() => onAddToCart(product)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-muted-foreground">/{product.unit}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <Badge variant="outline" className={getCategoryColor(product.category)}>
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </Badge>
            <Badge variant="outline" className={getStockColor(product.stock)}>
              {product.stock}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}