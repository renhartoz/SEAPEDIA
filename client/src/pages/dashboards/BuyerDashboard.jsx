import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wallet, MapPin, Package } from 'lucide-react'
import { WalletPage } from '@/pages/buyer/WalletPage'
import { AddressPage } from '@/pages/buyer/AddressPage'
import { OrdersPage } from '@/pages/buyer/OrdersPage'

export function BuyerDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Buyer Dashboard</h1>
        <p className="text-sm text-(--color-text-muted) mt-1">
          Manage your orders, addresses, and wallet balance
        </p>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-6">
          <TabsTrigger value="orders">
            <Package className="w-4 h-4 mr-2" />
            My Orders
          </TabsTrigger>
          <TabsTrigger value="wallet">
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="addresses">
            <MapPin className="w-4 h-4 mr-2" />
            Addresses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrdersPage />
        </TabsContent>
        <TabsContent value="wallet">
          <WalletPage />
        </TabsContent>
        <TabsContent value="addresses">
          <AddressPage />
        </TabsContent>
      </Tabs>
    </div>
  )
}
