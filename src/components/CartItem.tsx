import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CartItemType {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.quantity.toString());

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemove(item.id);
    } else {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const handleEditSubmit = () => {
    const newQuantity = parseFloat(editValue);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      onUpdateQuantity(item.id, newQuantity);
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditValue(item.quantity.toString());
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div className="flex-1 min-w-0 mr-2">
        <h4 className="text-sm font-medium truncate">{item.name}</h4>
        <p className="text-xs text-muted-foreground">
          {item.quantity} x Rp {item.price.toLocaleString('id-ID')}/{item.unit}
        </p>
        <p className="text-sm font-semibold">
          Rp {(item.quantity * item.price).toLocaleString('id-ID')}
        </p>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          size="sm"
          variant="outline"
          className="h-6 w-6 p-0"
          onClick={() => handleQuantityChange(item.quantity - 0.5)}
        >
          <Minus className="h-3 w-3" />
        </Button>

        {isEditing ? (
          <div className="flex items-center space-x-1">
            <Input
              type="number"
              step="0.5"
              min="0.5"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-16 h-6 text-xs text-center"
              onBlur={handleEditSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit();
                if (e.key === 'Escape') handleEditCancel();
              }}
              autoFocus
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            className="h-6 w-12 p-0 text-xs"
            onClick={() => setIsEditing(true)}
          >
            {item.quantity}
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          className="h-6 w-6 p-0"
          onClick={() => handleQuantityChange(item.quantity + 0.5)}
        >
          <Plus className="h-3 w-3" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="h-6 w-6 p-0 text-change hover:bg-change hover:text-change-foreground"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}