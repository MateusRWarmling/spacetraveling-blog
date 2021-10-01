import Header from '../components/Header';
import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Link from 'next/link';
import { useState } from 'react';

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

export default function Home({ postsPagination }: HomeProps) {
  const [data, setData] = useState(postsPagination);

  async function getNextPage(): Promise<void> {
      fetch(data.next_page)
        .then(response => response.json())
        .then(responseData => {
          const newPosts = responseData.results.reduce((acc, result) => {
            acc.push({
              uid: result.uid,
              first_publication_date: result.first_publication_date,
              data: {
                title: result.data.title,
                subtitle: result.data.subtitle,
                author: result.data.author,
              },
            })
            
            return acc;
          }, [...data.results]);

          setData({
            next_page: responseData.next_page,
            results: newPosts,
          })
        }) 
  }

  return(
    <>
      <Header />
      <main className={commonStyles.Container}>
        { data.results?.map( post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <a>
            <div className={styles.postContent}>
              <h2>
                {post.data.title}
              </h2>
              <p>{post.data.subtitle}</p>
              <div className={commonStyles.info}>
                <span><FiCalendar />{format(new Date(post.first_publication_date), 'dd MMM yyyy', {locale: ptBR,})}</span>
                <span><FiUser /> {post.data.author}</span>
              </div>
            </div>
            </a>
          </Link>
        ))}

        {
          data.next_page && (
            <button
              className={styles.newPageButton}
              onClick={getNextPage}
            >
              Carregar mais posts
            </button>
          )
        }  
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 1,
  })

  const posts = postsResponse.results.map(post => {
    return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  console.log(postsResponse)

  const { next_page } = postsResponse;

  const postsPagination = {
    results: posts,
    next_page,
  }

  return {
    props: {
      postsPagination,
    },
  };
};
