import { TabBar } from "@/components/tab-bar";

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="pb-29">{children}</div>
      <TabBar />
    </>
  );
}
