import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  User as UserIcon, 
  Users, 
  Gift, 
  MessageCircle, 
  Shield, 
  CreditCard, 
  TrendingUp,
  Star,
  Crown,
  Zap,
  Send,
  Check,
  X
} from "lucide-react";

interface UserProfileProps {
  currentUser: User;
}

interface Friend {
  id: number;
  playerId: string;
  username: string;
  avatar?: string;
  level: number;
  status: string;
  lastActive: string;
}

interface Gift {
  id: number;
  fromUserId: number;
  giftType: string;
  amount: number;
  message?: string;
  sentAt: string;
}

interface UserItem {
  id: number;
  itemType: string;
  itemName: string;
  quantity: number;
  isActive: boolean;
  expiresAt?: string;
}

interface Transaction {
  id: number;
  transactionType: string;
  goldAmount: number;
  pearlsAmount: number;
  description: string;
  createdAt: string;
}

export default function UserProfile({ currentUser }: UserProfileProps) {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [giftAmount, setGiftAmount] = useState(100);
  const [giftMessage, setGiftMessage] = useState("");
  const [messageText, setMessageText] = useState("");
  const [chargeAmount, setChargeAmount] = useState(1000);
  const { toast } = useToast();

  // جلب الأصدقاء
  const { data: friends = [] } = useQuery({
    queryKey: ['/api/profile/friends', currentUser.id],
  });

  // جلب طلبات الصداقة
  const { data: friendRequests = [] } = useQuery({
    queryKey: ['/api/profile/friend-requests', currentUser.id],
  });

  // جلب الهدايا
  const { data: gifts = [] } = useQuery({
    queryKey: ['/api/profile/gifts', currentUser.id],
  });

  // جلب العناصر والدروع
  const { data: userItems = [] } = useQuery({
    queryKey: ['/api/profile/items', currentUser.id],
  });

  // جلب المعاملات
  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/profile/transactions', currentUser.id],
  });

  // إرسال طلب صداقة
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (friendId: number) => {
      return await apiRequest(`/api/profile/friend-request`, {
        method: 'POST',
        body: JSON.stringify({ friendId }),
      });
    },
    onSuccess: () => {
      toast({ title: "تم إرسال طلب الصداقة", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ['/api/profile/friends'] });
    },
  });

  // قبول طلب صداقة
  const acceptFriendMutation = useMutation({
    mutationFn: async (friendshipId: number) => {
      return await apiRequest(`/api/profile/accept-friend`, {
        method: 'POST',
        body: JSON.stringify({ friendshipId }),
      });
    },
    onSuccess: () => {
      toast({ title: "تم قبول طلب الصداقة", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ['/api/profile/friends'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile/friend-requests'] });
    },
  });

  // إرسال هدية
  const sendGiftMutation = useMutation({
    mutationFn: async (data: { toUserId: number; giftType: string; amount: number; message: string }) => {
      return await apiRequest(`/api/profile/send-gift`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({ title: "تم إرسال الهدية بنجاح", variant: "default" });
      setGiftMessage("");
      setSelectedFriend(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user/currency'] });
    },
  });

  // استلام هدية
  const claimGiftMutation = useMutation({
    mutationFn: async (giftId: number) => {
      return await apiRequest(`/api/profile/claim-gift`, {
        method: 'POST',
        body: JSON.stringify({ giftId }),
      });
    },
    onSuccess: () => {
      toast({ title: "تم استلام الهدية", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ['/api/profile/gifts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/currency'] });
    },
  });

  // تفعيل عنصر
  const activateItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      return await apiRequest(`/api/profile/activate-item`, {
        method: 'POST',
        body: JSON.stringify({ itemId }),
      });
    },
    onSuccess: () => {
      toast({ title: "تم تفعيل العنصر", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ['/api/profile/items'] });
    },
  });

  // شحن الرصيد
  const chargeBalanceMutation = useMutation({
    mutationFn: async (amount: number) => {
      return await apiRequest(`/api/profile/charge-balance`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });
    },
    onSuccess: () => {
      toast({ title: "تم شحن الرصيد بنجاح", variant: "default" });
      queryClient.invalidateQueries({ queryKey: ['/api/user/currency'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile/transactions'] });
    },
  });

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'shield': return <Shield className="w-4 h-4" />;
      case 'energy_boost': return <Zap className="w-4 h-4" />;
      case 'score_multiplier': return <TrendingUp className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getItemColor = (itemType: string) => {
    switch (itemType) {
      case 'shield': return 'bg-blue-500';
      case 'energy_boost': return 'bg-yellow-500';
      case 'score_multiplier': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* بطاقة البروفايل الرئيسية */}
      <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <UserIcon className="w-10 h-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{currentUser.username}</h1>
              <p className="text-purple-100">رقم اللاعب: {currentUser.playerId}</p>
              <div className="flex items-center space-x-4 rtl:space-x-reverse mt-2">
                <Badge variant="secondary" className="bg-white/20">
                  <Crown className="w-3 h-3 mr-1" />
                  المستوى {currentUser.level}
                </Badge>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="text-yellow-300">🪙 {currentUser.goldCoins}</span>
                  <span className="text-blue-300">🦪 {currentUser.pearls}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="friends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            الأصدقاء
          </TabsTrigger>
          <TabsTrigger value="gifts" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            الهدايا
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            الرسائل
          </TabsTrigger>
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            العناصر
          </TabsTrigger>
          <TabsTrigger value="charge" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            الشحن
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            التاريخ
          </TabsTrigger>
        </TabsList>

        {/* علامة تبويب الأصدقاء */}
        <TabsContent value="friends">
          <div className="grid md:grid-cols-2 gap-6">
            {/* طلبات الصداقة */}
            <Card>
              <CardHeader>
                <CardTitle>طلبات الصداقة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {friendRequests.map((request: Friend) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.username}</p>
                        <p className="text-sm text-gray-500">#{request.playerId}</p>
                      </div>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button size="sm" onClick={() => acceptFriendMutation.mutate(request.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {friendRequests.length === 0 && (
                    <p className="text-center text-gray-500 py-4">لا توجد طلبات صداقة</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* قائمة الأصدقاء */}
            <Card>
              <CardHeader>
                <CardTitle>أصدقائي ({friends.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {friends.map((friend: Friend) => (
                    <div key={friend.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {friend.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{friend.username}</p>
                          <p className="text-sm text-gray-500">#{friend.playerId}</p>
                          <Badge 
                            variant={friend.status === 'online' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {friend.status === 'online' ? 'متصل' : 'غير متصل'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedFriend(friend)}>
                              <Gift className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>إرسال هدية إلى {friend.username}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">نوع الهدية</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button 
                                    variant="outline" 
                                    className="flex items-center gap-2"
                                    onClick={() => {
                                      sendGiftMutation.mutate({
                                        toUserId: friend.id,
                                        giftType: 'gold',
                                        amount: giftAmount,
                                        message: giftMessage
                                      });
                                    }}
                                  >
                                    🪙 {giftAmount} ذهب
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="flex items-center gap-2"
                                    onClick={() => {
                                      sendGiftMutation.mutate({
                                        toUserId: friend.id,
                                        giftType: 'pearls',
                                        amount: Math.floor(giftAmount / 100),
                                        message: giftMessage
                                      });
                                    }}
                                  >
                                    🦪 {Math.floor(giftAmount / 100)} لؤلؤ
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">المبلغ</label>
                                <Input
                                  type="number"
                                  value={giftAmount}
                                  onChange={(e) => setGiftAmount(Number(e.target.value))}
                                  min="1"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">رسالة (اختيارية)</label>
                                <Textarea
                                  value={giftMessage}
                                  onChange={(e) => setGiftMessage(e.target.value)}
                                  placeholder="اكتب رسالة..."
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {friends.length === 0 && (
                    <p className="text-center text-gray-500 py-4">لا توجد أصدقاء حتى الآن</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* علامة تبويب الهدايا */}
        <TabsContent value="gifts">
          <Card>
            <CardHeader>
              <CardTitle>الهدايا المستلمة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gifts.map((gift: Gift) => (
                  <div key={gift.id} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {gift.giftType === 'gold' ? '🪙' : '🦪'} {gift.amount} 
                          {gift.giftType === 'gold' ? ' ذهب' : ' لؤلؤ'}
                        </p>
                        {gift.message && (
                          <p className="text-sm text-gray-600">"{gift.message}"</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(gift.sentAt).toLocaleDateString('ar')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => claimGiftMutation.mutate(gift.id)}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      استلام
                    </Button>
                  </div>
                ))}
                {gifts.length === 0 && (
                  <p className="text-center text-gray-500 py-8">لا توجد هدايا</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* علامة تبويب الرسائل */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>الرسائل الخاصة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                قريباً: نظام الرسائل الخاصة
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* علامة تبويب العناصر والدروع */}
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>عناصري ودروعي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userItems.map((item: UserItem) => (
                  <div 
                    key={item.id} 
                    className={`p-4 border rounded-lg ${item.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getItemColor(item.itemType)}`}>
                        {getItemIcon(item.itemType)}
                      </div>
                      {item.isActive && (
                        <Badge className="bg-green-500">فعال</Badge>
                      )}
                    </div>
                    <h3 className="font-medium">{item.itemName}</h3>
                    <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                    {item.expiresAt && (
                      <p className="text-xs text-red-500">
                        ينتهي: {new Date(item.expiresAt).toLocaleDateString('ar')}
                      </p>
                    )}
                    {!item.isActive && (
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => activateItemMutation.mutate(item.id)}
                      >
                        تفعيل
                      </Button>
                    )}
                  </div>
                ))}
                {userItems.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-8">
                    لا توجد عناصر
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* علامة تبويب شحن الرصيد */}
        <TabsContent value="charge">
          <Card>
            <CardHeader>
              <CardTitle>شحن الرصيد</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-4">شحن سريع</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[500, 1000, 2500, 5000].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        onClick={() => chargeBalanceMutation.mutate(amount)}
                        className="flex flex-col items-center p-4 h-auto"
                      >
                        <span className="text-2xl mb-1">🪙</span>
                        <span>{amount} ذهب</span>
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-4">مبلغ مخصص</h3>
                  <div className="space-y-3">
                    <Input
                      type="number"
                      value={chargeAmount}
                      onChange={(e) => setChargeAmount(Number(e.target.value))}
                      placeholder="أدخل المبلغ"
                      min="1"
                    />
                    <Button 
                      className="w-full"
                      onClick={() => chargeBalanceMutation.mutate(chargeAmount)}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      شحن {chargeAmount} ذهب
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* علامة تبويب التاريخ */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>سجل المعاملات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transactions.map((transaction: Transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('ar')}
                      </p>
                    </div>
                    <div className="text-right">
                      {transaction.goldAmount !== 0 && (
                        <p className={transaction.goldAmount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {transaction.goldAmount > 0 ? '+' : ''}{transaction.goldAmount} 🪙
                        </p>
                      )}
                      {transaction.pearlsAmount !== 0 && (
                        <p className={transaction.pearlsAmount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {transaction.pearlsAmount > 0 ? '+' : ''}{transaction.pearlsAmount} 🦪
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">لا توجد معاملات</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}