import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" aria-label="Coletivo LESBILAB, página inicial" className="block">
      <Image src="/logo-h-amarelo.webp" alt="Coletivo LESBILAB" width={700} height={307} priority className="h-11 w-auto" />
    </Link>
  );
}
