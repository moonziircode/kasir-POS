import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import CartItem from './CartItem';

interface CartItemType {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
}

interface CartProps {
  items: CartItemType[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export default function Cart({ items, onUpdateQuantity, onRemove, onCheckout }: CartProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      {/* Summary Bar */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">{totalItems} item</span>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="font-bold">Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <Button onClick={onCheckout} size="sm">
            Checkout
          </Button>
        </div>
      </div>

      {/* Cart Items */}
      <Card className="m-4 mt-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Keranjang Belanja</CardTitle>
        </CardHeader>
        <CardContent className="max-h-60 overflow-y-auto">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}