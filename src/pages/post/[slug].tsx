import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import { RichText } from "prismic-dom";

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

import Header from '../../components/Header';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Prismic from '@prismicio/client'

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

export default function Post({post}: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <> 
        <Header />
        <h1>Carregando...</h1>
      </>
    );
  }
  
  function readTimeCalculator() {
    const numberOfWords = post.data.content.reduce((acc, content) => {
      acc.push(...content.heading.split(' '));

      const words = RichText.asText(content.body)
        .replace(/[^\w|\s]/g, '')
        .split(' ');

      acc.push(...words);

      return acc;
    }, [])

    return Math.ceil(numberOfWords.length / 200);
  }

  const readTime = readTimeCalculator();

  return (
    <>
      <Header />
      <img src={post.data.banner.url} alt="" className={styles.banner}/>
      <main className={commonStyles.Container}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <div className={commonStyles.info}>
          <span><FiCalendar />{format(new Date(post.first_publication_date), 'dd MMM yyyy', {locale: ptBR,})}</span>
          <span><FiUser /> {post.data.author}</span>
          <span><FiClock /> {readTime} min</span>
        </div>
        {
          post.data.content.map( content => (
            <div className={styles.postContent} key={content.heading}>
              <h2>{content.heading}</h2>
              <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(content.body) }} />
            </div>
          ))
        }
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
    }
  );

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    fallback: true,
    paths,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});
  
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
  data: {
    title: response.data.title,
    subtitle: response.data.subtitle,
    banner: {
      url: response.data.banner.url,
    },
    author: response.data.author,
    content: response.data.content,
    },
  }

  return {
    props: {
      post,
    }
  }
};
