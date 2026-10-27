import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

interface BlogResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  pages: number;
}

export function BlogList() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const { data, isLoading } = useQuery<BlogResponse>({
    queryKey: ['blog'],
    queryFn: () => fetchJson<BlogResponse>('/api/blog'),
  });

  const categories = ['All', 'Adoption Tips', 'Care Guides', 'Health & Wellness', 'Training'];

  const filteredPosts = data?.posts.filter((post) => {
    if (selectedCategory === 'All') return true;
    return post.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const featuredPost = data?.posts.find((p) => p.featured) || data?.posts[0];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl font-serif font-bold mb-4">PawConnect Blog</h1>
        <p className="text-lg text-muted-foreground">
          Helpful tips, heartwarming adoption stories, and expert advice for pet parents.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Featured Post Card */}
          {featuredPost && selectedCategory === 'All' && (
            <div className="mb-12">
              <Link href={`/blog/${featuredPost.id}`}>
                <Card className="overflow-hidden bg-card border-border hover:shadow-xl transition-all cursor-pointer group">
                  <div className="grid grid-cols-1 md:grid-cols-12">
                    <div className="md:col-span-7 h-64 md:h-96 overflow-hidden">
                      <img
                        src={featuredPost.imageUrl}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="md:col-span-5 p-8 flex flex-col justify-between">
                      <div>
                        <Badge className="mb-4">{featuredPost.category}</Badge>
                        <h2 className="text-3xl font-serif font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                          {featuredPost.title}
                        </h2>
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                          {featuredPost.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" /> {featuredPost.authorName}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> {featuredPost.readTime} min read
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          )}

          {/* Grid of Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts?.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <Card className="overflow-hidden bg-card border-border hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col">
                  <div className="h-48 overflow-hidden bg-muted">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className="text-primary font-medium">{post.category}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {post.readTime} min read
                        </span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground mt-auto">
                      <span>{post.authorName}</span>
                      <span className="flex items-center gap-1 text-primary font-medium group-hover:underline">
                        Read more <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
