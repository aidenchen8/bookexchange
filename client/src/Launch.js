import React from "react";

import { Form, Input, Button, Card, message, Empty, Descriptions, Comment, DatePicker } from 'antd';
import { List } from 'antd';

import { Row, Col } from 'antd';
import { Modal } from 'antd';

import axios from 'axios'
import { url } from "./env";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

const tabList = [
    {
        key: 'list',
        tab: 'Personal List',
    },
    {
        key: 'launch',
        tab: 'launch',
    },
];

export class Launch extends React.Component {

    state = {
        key: 'list',
        email: undefined,
        list: [],
        originalList: [],
        fromDate: null,
        toDate: null,
        messageModal: false,
        messageEmail: undefined
    };

    onLaunch = (values) => {
        console.log('Success:', values);
        axios.post(`${url.base}/publish`, {
            title: values.book_title,
            category: values.category,
            price: values.price,
            description: values.description,
            seller: this.state.email,
            author: values.author
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(function (response) {
            console.log(response);

            if (response.data === "ok") {
                message.info('Publish book successfully');
            } else {
                message.error('Publish book failed');
            }
        }).catch(function (error) {
            message.error('Publish book failed');
            console.log(error);
        });
    };

    refreshTimer=-1;

    componentDidMount = () => {
        this.setState({
            email: window.localStorage.getItem("email")
        });

        this.updateList();
        
        // this.refreshTimer=window.setInterval(()=>{
        //     this.updateList()
        // }, 3000);
    }

    componentWillUnmount = () => {
        clearInterval(this.refreshTimer)
    }

    updateList = () => {
        const email = window.localStorage.getItem("email")


        axios.get(`${url.base}/list/mine?seller=${email}`).then(
            (response) => {
                console.log(response.data);
                this.setState({
                    list: [...response.data].filter(each => each.title != null),
                    originalList: [...response.data].filter(each => each.title != null)
                });
            }
        ).catch((error) => {
            console.log(error);
        });

    }

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    contentList = {
        list: <div></div>,
        launch: <Form
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={this.onLaunch}
            onFinishFailed={this.onFinishFailed}
        >
            <Form.Item
                label="Book Title"
                name="book_title"
                rules={[{ required: true, message: 'Please input your Book title!' }]}
            >
                <Input maxLength="32"/>
            </Form.Item>

            <Form.Item
                label="category"
                name="category"
                rules={[{ required: true, message: 'Please input your category!' }]}
            >
                <Input maxLength="16"/>
            </Form.Item>

            <Form.Item
                label="author"
                name="author"
                rules={[{ required: true, message: 'Please input the author!' }]}
            >
                <Input maxLength="32"/>
            </Form.Item>

            <Form.Item
                label="Price"
                name="price"
                rules={[{ required: true, message: 'Please input your price!' }]}
            >
                <Input type="number" />
            </Form.Item>

            <Form.Item
                label="description"
                name="description"
                rules={[{ required: true, message: 'Please input your description!' }]}>
                <TextArea showCount maxLength={256} onChange={this.onChange} ></TextArea>
            </Form.Item>

            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                    Publish Book
                </Button>
            </Form.Item>
        </Form>
    };

    onTabChange = (key, type) => {
        console.log(key, type);
        this.setState({ [type]: key });
    };

    onChange = e => {
        console.log('Change:', e.target.value);
    };

    exchangeBook = (item) => {
        axios.get(`${url.base}/exchange?book=${item["_id"]}`).then((response) => {
            if (response.data === "ok") {
                message.info("Exchange successfully");
                this.updateList();
            } else {
                message.error("Exchange failed");
            }
        }).catch((error) => {
            message.error("Exchange failed");
        });
    }

    soldBook = (item) => {
        axios.get(`${url.base}/sold?book=${item["_id"]}`).then((response) => {
            if (response.data === "ok") {
                message.info("Sold successfully");
                this.updateList();
            } else {
                message.error("Sold failed");
            }
        }).catch((error) => {
            message.error("Sold failed");
        });
    }

    cancelBuy = (item) => {

        axios.get(`${url.base}/cancel?book=${item["_id"]}`).then((response) => {
            if (response.data === "ok") {
                message.info("Cancel successfully");
                this.updateList();
            } else {
                message.error("Cancel failed");
            }
        }).catch((error) => {
            message.error("Cancel failed");
        });
    }

    deleteBook = (item) => {
        axios.get(`${url.base}/delete?book=${item["_id"]}`).then((response) => {
            if (response.data === "ok") {
                message.info("Delete successfully");
                this.updateList();
            } else {
                message.error("Delete failed");
            }
        }).catch((error) => {
            message.error("Delete failed");
        });
    }

    getActionButton = (item) => {
        if (item.status === "lock") {
            return <Button key="list-lock-edit" type="primary" onClick={() => {
                this.exchangeBook(item);
            }}>Exchange</Button>;
        }
        else if (item.status === "exchange") {
            return <Button key="list-exchange-edit" type="primary" onClick={() => {
                this.soldBook(item);
            }}>Sold</Button>;
        }
        else {
            return <Button key="list-loadmore-edit" disabled type="primary">Exchange</Button>;
        }
    }

    showMessageModal = () => {
        this.setState({
            messageModal: true
        })
    };

    handleMessageOk = () => {
        this.setState({
            messageModal: false
        })
    };

    handleMessageCancel = () => {
        this.setState({
            messageModal: false
        })
    };

    onTimeChange = (dates, dateStrings) => {
        const fromDate = dates[0].toDate();
        const toDate = dates[1].toDate();

        let originalList = [...this.state.originalList]

        this.setState({
            fromDate: fromDate,
            toDate: toDate,
            list: originalList.filter(each => {
                const d = new Date(each.publishTime)
                return d >= fromDate && d <= toDate;
            })
        });
    }

    render = () => {

        console.log("render", this.state.list)

        if (this.state.email == undefined) {
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

            let main = <></>

            if (this.state.key == "list") {
                main = <div>
                    <RangePicker onChange={this.onTimeChange} />
                    <List
                        itemLayout="horizontal"
                        dataSource={this.state.list}
                        renderItem={item => (
                            <List.Item actions={[
                                this.getActionButton(item),
                                <Button danger key="list-cancel-edit" type="primary" onClick={() => {
                                    this.cancelBuy(item);
                                }}>Cancel</Button>,
                                <Button key="list-message-edit" type="primary" onClick={() => {
                                    this.showMessageModal();
                                    this.setState({
                                        "messageEmail": item.buyer
                                    })
                                }} disabled={item.status === "available"}>Notify Buyer</Button>,
                                <Button danger key="list-delete-edit" type="primary" onClick={() => {
                                    this.deleteBook(item);
                                }}>Delete</Button>
                            ]}>
                                {/* <List.Item> */}
                                <List.Item.Meta
                                    title={item.title + "(" + item.category + ")"}
                                    description={[<div>publishTime: {item.publishTime}</div>, <div>{item.description}</div>]}
                                />
                                <div style={{ fontWeight: "bold" }}><span style={{ color: "darkred" }}>Price: {item.price}</span>&nbsp; | &nbsp;<span style={{ color: "green" }}>{item.status}</span></div>
                            </List.Item>
                        )}
                    />
                </div>
            } else {
                main = this.contentList[this.state.key]
            }

            return (
                <>
                    <Card
                        style={{ minWidth: '355px', margin: "auto" }}
                        tabList={tabList}
                        activeTabKey={this.state.key}
                        onTabChange={key => {
                            this.onTabChange(key, 'key');
                        }}
                    >
                        {main}
                    </Card>
                    <Modal title="Message" width="300" visible={this.state.messageModal} onOk={this.handleMessageOk} onCancel={this.handleMessageCancel}>
                        <Message email={this.state.messageEmail}></Message>
                    </Modal>
                </>
            )
        }
    }
}

export class Message extends React.Component {


    state = {
        email: null,
        name: null,
        messageList: [],
        send: ""
    }


    timer = 0
    componentDidMount = () => {
        clearInterval(this.timer);

        const myEmail = window.localStorage.getItem("email");

        if (myEmail != null) {
            axios.get(`${url.base}/user?email=${this.props.email}`).then((response) => {
                if (response.data.length == 0) {
                    message.error("No user found");
                } else {
                    this.setState({
                        email: response.data[0].email,
                        name: response.data[0].name
                    });
                }
            }).catch((error) => {
                message.error("No user found");
            });

            this.timer = setInterval(() => {
                axios.get(`${url.base}/chat/receive?from=${this.props.email}&to=${myEmail}`).then((response) => {
                    this.setState({
                        messageList: response.data
                    });
                    console.log("fetch message done.", response.data)
                }).catch((error) => {
                    message.error("No message found");
                });
            }, 2000);
        }


    }

    componentWillUnmount = () => {
        clearInterval(this.timer)
    }

    send = () => {
        let myEmail = window.localStorage.getItem("email");
        if (this.state.send != null && myEmail != null) {
            axios.post(`${url.base}/chat/send`, {
                "from": myEmail,
                "to": this.props.email,
                "message": this.state.send
            },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then((response) => {
                    console.log(response);

                    if (response.data === "ok") {
                        message.info('Send message successfully');
                        this.state.send = "";
                    } else {
                        message.error('Send message failed');
                    }
                }).catch(function (error) {
                    message.error('Send message failed');
                    console.log(error);
                });
        }
    }

    onSendChange = (e) => {
        this.setState({
            send: e.target.value
        })
    }
    render = () => {
        return (
            <Row>
                <Col span={6}>
                    <Descriptions title="User Info" bordered>
                        <Descriptions.Item label="Full Name" span="3">{this.state.name}</Descriptions.Item>
                        <Descriptions.Item label="Email" span="3">{this.state.email}</Descriptions.Item>
                    </Descriptions>
                </Col>
                <Col span={18}>
                    <List
                        style={{ marginLeft: 30, height: "40vh", overflow:"auto" }}
                        header={`${this.state.messageList.length} replies`}
                        itemLayout="horizontal"
                        dataSource={this.state.messageList}
                        renderItem={item => (
                            <li>
                                <Comment
                                    author={item.from}
                                    avatar={'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'}
                                    content={item.message}
                                    datetime={item.time}
                                />
                            </li>
                        )}
                    />,
                    <TextArea style={{ marginLeft: 30, width: "50vw", }} value={this.state.send} rows={4} onChange={this.onSendChange} />
                    <Button style={{ marginLeft: 30 }} type="primary" onClick={this.send}>Send</Button>
                </Col>
            </Row>
        )
    }


}