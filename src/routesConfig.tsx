
    import { Route } from 'react-router-dom';
    import HELLO from './pages/hello/index';
import . from './pages/index';
    export const routes = [
        <Route path="/hello" element={<HELLO />} />
<Route path="/index" element={<. />} />
    ];
  