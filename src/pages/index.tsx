import Link from 'next/link';
import { GetStaticProps } from 'next';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { useState } from 'react';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { postFormater } from '../utils/postFormater';

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
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview = true,
}: HomeProps): JSX.Element {
  const { results, next_page } = postsPagination;

  const postsFormatados = postFormater({ posts: results });

  const [posts, setPosts] = useState<Post[]>(postsFormatados);
  const [page, setPage] = useState<string>(next_page);

  async function loadingNextPage(): Promise<void> {
    if (next_page) {
      const newPosts = await fetch(`${next_page}`)
        .then(response => response.json())
        .then(data => data);

      const newPostsFormatados = postFormater({ posts: newPosts.results });

      setPosts([...posts, ...newPostsFormatados]);
      setPage(newPosts.next_page);
    }
  }

  return (
    <div className={styles.homeContainer}>
      <img src="/images/logo.svg" alt="Logo Spacetraveling" />

      {posts &&
        posts.map(post => (
          <section className={styles.postSection} key={post.uid}>
            <Link href={`/post/${post.uid}`} passHref>
              <a>
                <h1>{post.data.title}</h1>
                <p>{post.data.subtitle}</p>
                <div>
                  <span>
                    <FiCalendar fontSize="2rem" />
                    <p>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </p>
                    <FiUser fontSize="2rem" className={styles.space} />
                    <p>{post.data.author}</p>
                  </span>
                </div>
              </a>
            </Link>
          </section>
        ))}

      {page && (
        <button
          type="button"
          className={styles.btnLoading}
          onClick={() => loadingNextPage()}
        >
          Carregar mais posts
        </button>
      )}

      {preview && (
        <aside className={styles.previewContainer}>
          <Link href="/api/exit-preview">
            <a>Sair do modo Preview</a>
          </Link>
        </aside>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
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
        results: postsResponse.results,
        next_page: postsResponse.next_page,
      },
    },
    revalidate: 60 * 60, // 1 hour
  };
};
