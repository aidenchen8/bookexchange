import './App.css';
import 'antd/dist/antd.css';
import { Layout, Menu } from 'antd';
import React from 'react';
import { Login } from './Login';
import { Launch } from './Launch';
import { Purchase } from './Purchase'
import { Account } from './Account';
import { Home } from './Home'

const { Header, Content, Footer } = Layout;

class App extends React.Component {

  state = {
    selectedKey: "1"
  }

  changeMenu = (menu) => {
    this.setState({
      selectedKey: menu
    })
  }

  afterLogon = () => {
    console.log("log")
    this.setState({
      selectedKey: "1"
    });
  }

  afterLogoutside = () => {
    console.log("logout")
    this.setState({
      selectedKey: "5"
    });
  }

  componentDidMount = () => {
    if(window.localStorage.getItem("email") == null){
      this.setState({
        selectedKey: "5"
    });
  }
}

  render = () => {

    let mainPanel = <div>
      hello
    </div>

    if (this.state.selectedKey === "1") {
      mainPanel = <div>
        <Home></Home>
      </div>
    }
    else if (this.state.selectedKey === "2") {
      mainPanel = <div>
        <Launch></Launch>
      </div>
    }
    else if (this.state.selectedKey === "3") {
      mainPanel = <div>
        <Purchase></Purchase>
      </div>
    }
    else if (this.state.selectedKey === "4") {
      mainPanel = <div>
        <Account afterLogout={this.afterLogoutside}></Account>
      </div>
    }
    else if (this.state.selectedKey === "5") {
      mainPanel = <div>
        <Login afterLogin={this.afterLogon}></Login>
      </div>
    }

    return (
      <Layout className="layout">
        <Header>
          {/* <div className="logo" >Soton Book Exchange</div> */}
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]} selectedKeys={[this.state.selectedKey]}>
            <Menu.Item className="logo">Soton Book Exchange</Menu.Item>
            <Menu.Item key="1" onClick={() => { this.changeMenu("1") }}>Home</Menu.Item>
            <Menu.Item key="2" onClick={() => { this.changeMenu("2") }}>Launch</Menu.Item>
            <Menu.Item key="3" onClick={() => { this.changeMenu("3") }}>My purchase</Menu.Item>
            <Menu.Item key="4" onClick={() => { this.changeMenu("4") }} ref="account">My Account</Menu.Item>
            <Menu.Item key="5" onClick={() => { this.changeMenu("5") }} ref="login">Login</Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 10px' }}>
          <div className="site-layout-content" style={{ marginTop: 20, minHeight: "78vh" }}>
            {mainPanel}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Southampton Book Exchange</Footer>
      </Layout>
    );
  }

}

export default App;
