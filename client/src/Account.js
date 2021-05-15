
import React from "react";
import { Card, Empty, Button, Row, Col, message } from 'antd';

const { Meta } = Card;

export class Account extends React.Component {


    state = {
        email: null,
        name: null
    }

    componentDidMount = () => {
        this.setState({
            email: window.localStorage.getItem("email"),
            name: window.localStorage.getItem("name")
        });
    }

    logout = (values) => {
        window.localStorage.clear();
        if(window.localStorage.getItem("email") == undefined){
            message.info('Logout successfully');
            console.log("afterLogout", this.props.afterLogout)
            this.props.afterLogout();
        }else{
            message.error('Logout failed');
        }

    }


    render = () => {

        if (this.state.email == null) {
            return <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                imageStyle={{
                    height: 60,
                }}
                description={
                    "Please login first"
                }
            ></Empty>
        } else {
            return <Row >
                <Col sm={20} md={16} lg={12} xl={8} style={{ margin:"50px auto", textAlign:"center" }}>
                    <Meta title={"Full Name: "+this.state.name} description={"Email Address: "+this.state.email} />

                    <Button type="primary" onClick={this.logout} style={{ marginTop:"20px" }}>
                        LogOut
                    </Button>
                </Col>

            </Row>
        }
    }
}