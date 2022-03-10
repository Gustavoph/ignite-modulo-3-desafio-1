import Link from 'next/link';
import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.postHeader}>
      <Link href="/" passHref>
        <a>
          <img src="/images/logo.svg" alt="Logo Spacetraveling" />
        </a>
      </Link>
    </header>
  );
}
