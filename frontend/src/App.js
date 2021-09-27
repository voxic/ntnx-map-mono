import React from 'react';
import Dashboard from './components/dashboard/Dashboard'
import ClusterList from './components/clusterlist/ClusterList'
import PrismCentralConfig from './components/configuration/PrismCentralConfig'
import LocationConfig from './components/configuration/LocationConfig'
import Login from './components/Login'
import UserConfig from './components/configuration/UserConfig'
import PrivateRoute from './components/PrivateRoute'
import { AuthProvider } from './contexts/AuthContext'
import { ClusterData } from './contexts/ClusterData'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import ClusterDetailsPage from './components/clusterDetails/ClusterDetailsPage';
import Logout from './components/Logout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/logout" component={Logout} />
          <PrivateRoute path="/locations" component={LocationConfig} />
          <PrivateRoute path="/users" component={UserConfig} />
          <ClusterData>
            <PrivateRoute exact path="/" component={Dashboard} />
            <PrivateRoute path="/clusterlist" component={ClusterList} />
            <PrivateRoute path="/prismcentral" component={PrismCentralConfig} />
            <PrivateRoute path="/clusterdetails/:id" component={ClusterDetailsPage} />
          </ClusterData>
            
        </Switch>
      </AuthProvider>
    </Router>
  );
}

export default App;
