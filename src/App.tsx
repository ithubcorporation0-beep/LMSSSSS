import { AppProvider, useApp } from './store';
import Layout from './components/Layout';
import { HomePage, CatalogPage, CourseDetailPage } from './pages/public';
import { StudentDashboard, StudentCoursesPage, StudentWishlistPage, LearningPage, CertificatesPage, CertificateVerifyPage } from './pages/student';
import { TeacherDashboard, TeacherCoursesPage, CourseEditorPage, TeacherStudentsPage, TeacherAnalyticsPage } from './pages/teacher';
import { AdminOverviewPage, AdminUsersPage, AdminCoursesPage, AdminCategoriesPage } from './pages/admin';

function Router() {
  const { route } = useApp();
  switch (route.page) {
    case 'home':
      return <HomePage />;
    case 'catalog':
      return <CatalogPage initialCategoryId={route.categoryId} search={route.search} />;
    case 'course':
      return <CourseDetailPage courseId={route.id} />;
    case 's-dash':
      return <StudentDashboard />;
    case 's-courses':
      return <StudentCoursesPage />;
    case 's-wishlist':
      return <StudentWishlistPage />;
    case 's-learn':
      return <LearningPage courseId={route.courseId} chapterId={route.chapterId} />;
    case 's-certs':
      return <CertificatesPage />;
    case 'verify':
      return <CertificateVerifyPage initialCode={route.code} />;
    case 't-dash':
      return <TeacherDashboard />;
    case 't-courses':
      return <TeacherCoursesPage initialOpenNew={route.newCourse} />;
    case 't-edit':
      return <CourseEditorPage courseId={route.id} />;
    case 't-students':
      return <TeacherStudentsPage />;
    case 't-analytics':
      return <TeacherAnalyticsPage />;
    case 'a-dash':
      return <AdminOverviewPage />;
    case 'a-users':
      return <AdminUsersPage />;
    case 'a-courses':
      return <AdminCoursesPage />;
    case 'a-cats':
      return <AdminCategoriesPage />;
    default:
      return <HomePage />;
  }
}

function Shell() {
  const { route } = useApp();
  const key = JSON.stringify(route);
  return (
    <Layout>
      <div key={key} className="animate-page">
        <Router />
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
