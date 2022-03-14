/* eslint-disable react/no-danger */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

// import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  const amountWordsOfBody = RichText.asText(
    post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
  ).split(' ').length;

  const amountWordsOfHeading = post.data.content.reduce((acc, data) => {
    if (data.heading) {
      return [...acc, ...data.heading.split(' ')];
    }

    return [...acc];
  }, []).length;

  const readingTime = Math.ceil(
    (amountWordsOfBody + amountWordsOfHeading) / 200
  );

  return (
    <div className={styles.postContainer}>
      <Header />
      <img
        src={post.data.banner.url}
        className={styles.banner}
        alt="Imagem do post"
      />

      <div className={styles.postContent}>
        <h1>{post.data.title}</h1>
        <div className={styles.info}>
          <span>
            <FiCalendar fontSize="2rem" />
            <p>
              {format(new Date(post.first_publication_date), 'dd LLL YYY', {
                locale: ptBR,
              })}
            </p>
            <FiUser fontSize="2rem" className={styles.space} />
            <p>{post.data.author}</p>
            <FiClock fontSize="2rem" className={styles.space} />
            <p>{readingTime} min</p>
          </span>
        </div>
        {post.data.content.map(content => (
          <div key={content.heading}>
            <h3>{content.heading}</h3>
            <div
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2, // posts per page
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const contents = response.data.content.map(content => ({
    heading: content.heading[0].text,
    body: [...content.body],
  }));

  const post = {
    data: {
      title: response.data.title,
      author: response.data.author,
      banner: response.data.imagem,
      content: [...contents],
    },
    first_publication_date: response.last_publication_date,
  };

  return {
    props: {
      post,
    },
  };
};
