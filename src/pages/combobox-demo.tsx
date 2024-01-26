import {
  VirtualizedCombobox,
  VirtualizedComboboxItem,
} from "@/components/VirtualizedComboBox";

function generateItems() {
  const items: VirtualizedComboboxItem[] = [];
  while (items.length < 20000) {
    const randomString = Math.random().toString(36).substr(2, 10);
    items.push({ label: randomString, value: randomString });
  }
  return items;
}
const items = generateItems();

function Page() {
  return <VirtualizedCombobox items={items} />;
}

export default Page;
