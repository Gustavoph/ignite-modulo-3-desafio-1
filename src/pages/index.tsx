import { GetStaticProps } from 'next';

import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  console.log(postsPagination);

  return (
    <div className={styles.homeContainer}>
      <img src="/images/logo.svg" alt="Logo Spacetraveling" />

      <section className={styles.postSection}>
        <h1>Como utilizar Hooks</h1>
        <p>Pensando em sincronização em vez de ciclos de vida.</p>
        <div>
          <span>
            <FiCalendar fontSize="2rem" /> <p>15 Mar 2021</p>
            <FiUser fontSize="2rem" className={styles.space} />
            <p>Joseph Oliveira</p>
          </span>
        </div>
      </section>

      <section className={styles.postSection}>
        <h1>Criando um app CRA do zero</h1>
        <p>
          Tudo sobre como criar a sua primeira aplicação utilizando Create React
          App.
        </p>
        <div>
          <span>
            <FiCalendar fontSize="2rem" /> <p>19 Abr 2021</p>
            <FiUser fontSize="2rem" className={styles.space} />
            <p>Danilo Vieira</p>
          </span>
        </div>
      </section>

      <section className={styles.postSection}>
        <h1>Como utilizar Hooks</h1>
        <p>Pensando em sincronização em vez de ciclos de vida.</p>
        <div>
          <span>
            <FiCalendar fontSize="2rem" /> <p>15 Mar 2021</p>
            <FiUser fontSize="2rem" className={styles.space} />
            <p>Joseph Oliveira</p>
          </span>
        </div>
      </section>

      <button type="button" className={styles.btnLoading}>
        Carregar mais posts
      </button>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: [
        'posts.author',
        'posts.title',
        'posts.first_publication_date',
        'posts.subtitle',
      ],
      pageSize: 2,
    }
  );

  return {
    props: {
      postsPagination: {
        results: postsResponse,
        next_page: postsResponse.next_page,
      },
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
