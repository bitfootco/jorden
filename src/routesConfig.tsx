
    import { Route } from 'react-router-dom';
    import Root from './pages/index';
import Hello_index from './pages/hello/index';
    export const routes = [
        <Route key="Root" path="/" element={<Root />} />,
<Route key="Hello_index" path="/hello" element={<Hello_index />} />,
    ];
  