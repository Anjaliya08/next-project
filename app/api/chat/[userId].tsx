import { useRouter } from 'next/router';
import Chat from '../../../components/Chat';

export default function ChatPage() {
  const router = useRouter();
  const { userId } = router.query;

  if (!userId || typeof userId !== 'string') return <p>Loading...</p>;

  return <Chat userId={userId} />;
}
