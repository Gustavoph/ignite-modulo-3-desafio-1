import { GetStaticProps } from 'next';
import Link from 'next/link';

import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
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
  const { results, next_page } = postsPagination;

  return (
    <div className={styles.homeContainer}>
      <img src="/images/logo.svg" alt="Logo Spacetraveling" />

      {results.map(post => (
        <section className={styles.postSection} key={post.uid}>
          <Link href={`/post/${post.uid}`} passHref>
            <a>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div>
                <span>
                  <FiCalendar fontSize="2rem" />
                  <p>{post.first_publication_date}</p>
                  <FiUser fontSize="2rem" className={styles.space} />
                  <p>{post.data.author}</p>
                </span>
              </div>
            </a>
          </Link>
        </section>
      ))}

      {next_page && (
        <button type="button" className={styles.btnLoading}>
          Carregar mais posts
        </button>
      )}
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

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: new Date(
        post.last_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    };
  });

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      },
    },
    revalidate: 60 * 60, // 1 hour
  };
};
