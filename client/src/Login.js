import React from "react";

import { Form, Input, Button, Card, message, Empty, Row, Col } from 'antd';
import md5 from "md5";
import axios from 'axios'
import { url } from "./env";

const { Meta } = Card;

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { 
        xs:{span: 24},
        sm:{offset: 8, span: 16} 
    },
};

const tabList = [
    {
        key: 'login',
        tab: 'login',
    },
    {
        key: 'register',
        tab: 'register',
    },
];

export class Login extends React.Component {



    onRegister = (values) => {
        console.log('Success:', values);
        if (values.register_password === values.register_password_confirm) {
            axios.post(`${url.base}/register`, {
                email: values.register_email,
                password: md5(values.register_password),
                name: values.register_full_name
            }).then((response) => {
                console.log(response);
                if (response.data === "ok") {
                    message.info('Register successfully');
                } else {
                    message.error('Register failed');
                }
            }).catch(function (error) {
                message.error('Register failed');
                console.log(error);
            });
        } else {
            message.error('Please confirm your password');
        }
    };

    onLogin = (values) => {
        console.log('Success:', values);
        axios.get(`${url.base}/login?email=${values.email}&password=${md5(values.password)}&name=${values.full_name}`)
            .then((response) => {
                console.log(response);
                if (response.data === "ok") {
                    message.info('Login successfully');
                    window.localStorage.setItem("email", values.email);
                    window.localStorage.setItem("name", values.full_name);
                    console.log("afterLogin", this.props.afterLogin)
                    this.props.afterLogin();
                } else {
                    message.error('Login failed');
                    window.localStorage.removeItem("email");
                }
            })
            .catch(function (error) {
                console.log(error);
                message.info('Login failed');
                window.localStorage.removeItem("email");
            });
    };



    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    contentList = {
        login: <Form
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={this.onLogin}
            onFinishFailed={this.onFinishFailed}
        >
            <Form.Item
                label="Email"
                name="email"
                rules={[{type: 'email', required: true, message: 'Please input your email!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Full Name"
                name="full_name"
                rules={[{ required: true, message: 'Please input your full name!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                    Login
                </Button>
            </Form.Item>
        </Form>,
        register: <Form
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={this.onRegister}
            onFinishFailed={this.onFinishFailed}
        >
            <Form.Item
                label="Email"
                name="register_email"
                rules={[{type: 'email', required: true, message: 'Please input your email!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Full Name"
                name="register_full_name"
                rules={[{ required: true, message: 'Please input your full name!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Password"
                name="register_password"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item
                label="Password Confirm"
                name="register_password_confirm"
                rules={[{ required: true, message: 'Please confirm your password!' }]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                    Register
                </Button>
            </Form.Item>
        </Form>
    };

    onTabChange = (key, type) => {
        console.log(key, type);
        this.setState({ [type]: key });
    };

    state = {
        key: 'login',
        email: null,
        name: null
    };

    componentDidMount = () => {
        this.setState({
            email: window.localStorage.getItem("email"),
            name: window.localStorage.getItem("name")
        });
    }

    render = () => {
        if (this.state.email == null) {
            return (
                <Row>
                    <Col sm={20} md={16} lg={12} xl={8} style={{ minWidth: '300px', margin: "0 auto" }}>
                        <Card
                            style={{width:"100%", minWidth: '300px', margin: "0 auto" }}
                            tabList={tabList}
                            activeTabKey={this.state.key}
                            onTabChange={key => {
                                this.onTabChange(key, 'key');
                            }}
                        >
                            {this.contentList[this.state.key]}
                        </Card>
                    </Col>
                </Row>
    
            )
        }else{
            return <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            imageStyle={{
                height: 60,
            }}
            description={
                "you have loged"
            }
        ></Empty>
        }
        
    }
}
