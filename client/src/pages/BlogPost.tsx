import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'wouter';
import { ArrowLeft, Clock, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchJson } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  authorName: string;
  featured: boolean;
  readTime: number;
  createdAt: string;
}

export function BlogPost() {
  const params = useParams<{ id: string }>();
  const postId = parseInt(params.id || '1', 10);

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ['blogPost', postId],
    queryFn: () => fetchJson<BlogPost>(`/api/blog/${postId}`),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-96 w-full rounded-3xl mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-serif font-bold mb-4">Post Not Found</h2>
        <p className="text-muted-foreground mb-6">The blog article you are looking for does not exist.</p>
        <Link href="/blog">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Back button */}
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Blog
      </Link>

      {/* Header */}
      <div className="mb-8">
        <Badge className="mb-4">{post.category}</Badge>
        <h1 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border py-4">
          <span className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> {post.authorName}
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> {formatDate(post.createdAt)}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> {post.readTime} min read
          </span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="rounded-3xl overflow-hidden mb-10 shadow-lg border border-border">
        <img src={post.imageUrl} alt={post.title} className="w-full h-auto max-h-[500px] object-cover" />
      </div>

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none text-foreground leading-relaxed space-y-6">
        <p className="text-xl text-muted-foreground font-serif italic border-l-4 border-primary pl-4 py-1">
          {post.excerpt}
        </p>
        <div className="text-base whitespace-pre-line leading-loose text-foreground/90">
          {post.content}
        </div>
      </div>

      {/* Bottom Back Button */}
      <div className="mt-16 pt-8 border-t border-border flex justify-between items-center">
        <Link href="/blog">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Articles
          </Button>
        </Link>
        <Link href="/pets">
          <Button>Meet Adoptable Pets</Button>
        </Link>
      </div>
    </article>
  );
}
