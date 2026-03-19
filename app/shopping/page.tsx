import ShoppingChecklist from '@/components/ShoppingChecklist';
import { getShoppingList } from '@/lib/data';

export default function ShoppingPage() {
  const shoppingListZh = getShoppingList('zh');
  const shoppingListEn = getShoppingList('en');
  return (
    <main className="max-w-[960px] mx-auto pb-20">
      <ShoppingChecklist shoppingListZh={shoppingListZh} shoppingListEn={shoppingListEn} />
    </main>
  );
}
