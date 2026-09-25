import { redirect } from 'next/navigation';

/** La root "/" reindirizza sempre alla dashboard. */
export default function HomePage() {
  redirect('/dashboard');
}
