import { JoinPage } from "@/components/JoinPage";

interface Props {
  params: Promise<{ code: string }>;
}

export default async function Page({ params }: Props) {
  const { code } = await params;
  return <JoinPage code={code.toUpperCase()} />;
}
