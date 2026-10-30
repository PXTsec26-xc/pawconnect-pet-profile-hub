import { Switch, Route } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

import { Home } from '@/pages/Home';
import { PetsCatalog } from '@/pages/PetsCatalog';
import { PetDetail } from '@/pages/PetDetail';
import { AdoptForm } from '@/pages/AdoptForm';
import { Shelters } from '@/pages/Shelters';
import { BlogList } from '@/pages/BlogList';
import { BlogPost } from '@/pages/BlogPost';
import { RescueReport } from '@/pages/RescueReport';
import { About } from '@/pages/About';
import { Contact } from '@/pages/Contact';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { NotFound } from '@/pages/NotFound';

export function App() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/pets" component={PetsCatalog} />
          <Route path="/pets/:id" component={PetDetail} />
          <Route path="/adopt/:petId" component={AdoptForm} />
          <Route path="/shelters" component={Shelters} />
          <Route path="/blog" component={BlogList} />
          <Route path="/blog/:id" component={BlogPost} />
          <Route path="/rescue" component={RescueReport} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/:tab" component={AdminDashboard} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

export default App;
