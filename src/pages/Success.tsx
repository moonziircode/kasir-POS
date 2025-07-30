import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    transactionId,
    totalAmount,
    paymentMethod,
    cashReceived,
    change
  } = location.state || {};

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'cash': return 'Tunai';
      case 'transfer': return 'Transfer';
      case 'qris': return 'QRIS';
      default: return method;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'text-cash';
      case 'transfer': return 'text-transfer';
      case 'qris': return 'text-qris';
      default: return 'text-primary';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-success" />
          </div>
          <CardTitle className="text-xl text-success">Transaksi Berhasil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold">
              Rp {totalAmount?.toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-muted-foreground">
              ID Transaksi: <span className="font-mono">{transactionId}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Metode Pembayaran:</span>
              <span className={getPaymentMethodColor(paymentMethod)}>
                {getPaymentMethodDisplay(paymentMethod)}
              </span>
            </div>
            
            {paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between">
                  <span>Uang Diterima:</span>
                  <span>Rp {cashReceived?.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kembalian:</span>
                  <span className="text-change font-bold">
                    Rp {change?.toLocaleString('id-ID')}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Otomatis kembali ke beranda dalam 3 detik...</p>
          </div>

          <Button onClick={() => navigate('/')} className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}