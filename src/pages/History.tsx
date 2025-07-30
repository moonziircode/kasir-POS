import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  total_amount: number;
  payment_method: string;
  transaction_date: string;
  transaction_items: {
    quantity: number;
    unit_price: number;
    subtotal: number;
    products: {
      name: string;
      unit: string;
    };
  }[];
}

const getPaymentMethodColor = (method: string) => {
  switch (method) {
    case 'cash': return 'bg-cash text-cash-foreground';
    case 'transfer': return 'bg-transfer text-transfer-foreground';
    case 'qris': return 'bg-qris text-qris-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getPaymentMethodName = (method: string) => {
  switch (method) {
    case 'cash': return 'Tunai';
    case 'transfer': return 'Transfer';
    case 'qris': return 'QRIS';
    default: return method;
  }
};

export default function History() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, [selectedDate]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          total_amount,
          payment_method,
          transaction_date,
          transaction_items (
            quantity,
            unit_price,
            subtotal,
            products (
              name,
              unit
            )
          )
        `)
        .gte('transaction_date', startOfDay.toISOString())
        .lte('transaction_date', endOfDay.toISOString())
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat riwayat transaksi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTransaction = (transactionId: string) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedTransactions(newExpanded);
  };

  const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.total_amount, 0);
  const transactionCount = transactions.length;

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <h1 className="text-xl font-bold ml-4">Riwayat Penjualan</h1>
      </div>

      {/* Date Picker */}
      <div className="mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              {format(selectedDate, 'dd MMMM yyyy', { locale: id })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-success">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
            <div className="text-sm text-muted-foreground">Pendapatan</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-primary">{transactionCount}</div>
            <div className="text-sm text-muted-foreground">Transaksi</div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map(transaction => (
            <Card key={transaction.id}>
              <Collapsible>
                <CollapsibleTrigger
                  className="w-full"
                  onClick={() => toggleTransaction(transaction.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="font-mono">
                          {transaction.id}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(transaction.transaction_date), 'HH:mm')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">
                          Rp {transaction.total_amount.toLocaleString('id-ID')}
                        </span>
                        <Badge className={getPaymentMethodColor(transaction.payment_method)}>
                          {getPaymentMethodName(transaction.payment_method)}
                        </Badge>
                        {expandedTransactions.has(transaction.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="px-4 pb-4 pt-0">
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Detail Item:</h4>
                      <div className="space-y-2">
                        {transaction.transaction_items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              {item.products.name} ({item.quantity} {item.products.unit})
                            </span>
                            <span>Rp {item.subtotal.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Total:</span>
                          <span>Rp {transaction.total_amount.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}

          {transactions.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Tidak ada transaksi pada tanggal ini</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}