import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const cart: CartItem[] = location.state?.cart || [];
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [loading, setLoading] = useState(false);

  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const change = parseFloat(cashReceived || '0') - totalAmount;

  const handleQuickAmount = (amount: number) => {
    const currentAmount = parseFloat(cashReceived || '0');
    setCashReceived((currentAmount + amount).toString());
  };

  const handleExactAmount = () => {
    setCashReceived(totalAmount.toString());
  };

  const clearAmount = () => {
    setCashReceived('');
  };

  const generateTransactionId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const processTransaction = async () => {
    if (paymentMethod === 'cash' && parseFloat(cashReceived || '0') < totalAmount) {
      toast({
        title: "Uang tidak cukup",
        description: "Jumlah uang yang diterima kurang dari total tagihan",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const transactionId = generateTransactionId();
      
      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          total_amount: totalAmount,
          payment_method: paymentMethod === 'cash' ? 'cash' : paymentMethod === 'transfer' ? 'card' : 'digital',
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create transaction items
      const transactionItems = cart.map(item => ({
        transaction_id: transaction.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.quantity * item.price,
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      // Navigate to success page
      navigate('/success', {
        state: {
          transactionId: transaction.id,
          totalAmount,
          paymentMethod,
          cashReceived: paymentMethod === 'cash' ? parseFloat(cashReceived) : totalAmount,
          change: paymentMethod === 'cash' ? change : 0,
        }
      });

    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaksi gagal",
        description: "Terjadi kesalahan saat memproses transaksi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Keranjang kosong</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <h1 className="text-xl font-bold ml-4">Checkout</h1>
      </div>

      <div className="space-y-6">
        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} ({item.quantity} {item.unit})</span>
                  <span>Rp {(item.quantity * item.price).toLocaleString('id-ID')}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex items-center space-x-2 cursor-pointer">
                  <div className="p-2 rounded bg-cash text-cash-foreground">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <span>Tunai</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="transfer" id="transfer" />
                <Label htmlFor="transfer" className="flex items-center space-x-2 cursor-pointer">
                  <div className="p-2 rounded bg-transfer text-transfer-foreground">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span>Transfer</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="qris" id="qris" />
                <Label htmlFor="qris" className="flex items-center space-x-2 cursor-pointer">
                  <div className="p-2 rounded bg-qris text-qris-foreground">
                    <Smartphone className="h-4 w-4" />
                  </div>
                  <span>QRIS</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Cash Payment Details */}
        {paymentMethod === 'cash' && (
          <Card>
            <CardHeader>
              <CardTitle>Pembayaran Tunai</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cash-received">Uang Diterima</Label>
                <Input
                  id="cash-received"
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleQuickAmount(5000)}>
                  +5K
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAmount(10000)}>
                  +10K
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAmount(20000)}>
                  +20K
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAmount(50000)}>
                  +50K
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickAmount(100000)}>
                  +100K
                </Button>
                <Button variant="outline" size="sm" onClick={handleExactAmount}>
                  Pas
                </Button>
                <Button variant="outline" size="sm" onClick={clearAmount}>
                  Clear
                </Button>
              </div>

              {cashReceived && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diterima:</span>
                    <span>Rp {parseFloat(cashReceived).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Kembalian:</span>
                    <span className={change >= 0 ? 'text-success' : 'text-change'}>
                      Rp {Math.max(0, change).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Process Payment */}
        <Button
          onClick={processTransaction}
          disabled={loading || (paymentMethod === 'cash' && parseFloat(cashReceived || '0') < totalAmount)}
          className="w-full"
          size="lg"
        >
          {loading ? 'Memproses...' : 'Proses Pembayaran'}
        </Button>
      </div>
    </div>
  );
}