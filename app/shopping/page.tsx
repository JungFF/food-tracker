import ShoppingChecklist from '@/components/ShoppingChecklist';
import { getShoppingList } from '@/lib/data';

export default function ShoppingPage() {
  const shoppingList = getShoppingList('zh');
  return (
    <main className="max-w-[960px] mx-auto pb-20">
      <ShoppingChecklist shoppingList={shoppingList} />
    </main>
  );
}
