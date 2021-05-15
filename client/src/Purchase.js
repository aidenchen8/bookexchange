import React from "react";

import { Modal, Input, Button, Card, message, Empty } from 'antd';
import { List } from 'antd';

import axios from 'axios'
import { url } from "./env";
import { Message } from "./Launch";

const { TextArea } = Input;


const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

export class Purchase extends React.Component {

    state = {
        key: 'list',
        email: undefined,
        list: [],
        reviewVisible: false,
        messageModal: false,
        messageEmail: undefined
    };

    onReview = () => {
        console.log("review", this.reviewBookId, this.review);
        if (this.reviewBookId != null && this.review != null) {
            axios.post(`${url.base}/review`, {
                book: this.reviewBookId,
                review: this.review
            },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(function (response) {
                    console.log(response);

                    if (response.data === "ok") {
                        message.info('Review book successfully');
                    } else {
                        message.error('Review book failed');
                    }
                }).catch(function (error) {
                    message.error('Review book failed');
                    console.log(error);
                });
        }
    };

    onReviewFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    refreshTimer = -1;

    componentDidMount = () => {
        this.setState({
            email: window.localStorage.getItem("email")
        });


        this.updateList();

        this.refreshTimer = window.setInterval(() => {
            this.updateList()
        }, 1000);
    }

    componentWillUnmount = () => {
        clearInterval(this.timer)
    }

    updateList = () => {
        const email = window.localStorage.getItem("email")


        axios.get(`${url.base}/list/buy?buyer=${email}`).then(
            (response) => {
                console.log("purchase", response.data);
                this.setState({
                    list: [...response.data].filter(each => each.title != null)
                });
            }
        ).catch((error) => {
            console.log(error);
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

    review = null;

    reviewBookId = null;

    onReviewChange = (e) => {
        // console.log(e.currentTarget.innerHTML)
        this.review = e.currentTarget.innerHTML;
    }



    showModal = () => {
        this.setState({
            reviewVisible: true
        });
    };

    handleOk = () => {
        this.onReview();
        this.setState({
            reviewVisible: false
        });
    };

    handleCancel = () => {
        this.setState({
            reviewVisible: false
        });
    };

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
            return (
                <>
                    <Card
                        style={{ minWidth: '355px', margin: "auto" }}
                        title="My purchase"
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={this.state.list}
                            renderItem={item => (
                                <List.Item actions={[
                                    <Button key="list-cancel-edit" type="primary"
                                        disabled={item.status !== "sold"}
                                        onClick={() => {
                                            this.showModal();
                                            this.reviewBookId = item["_id"];
                                        }}>Review</Button>,
                                    <Button danger key="list-cancel-edit"
                                        disabled={item.status === "sold"}
                                        type="primary" onClick={() => {
                                            this.cancelBuy(item);
                                        }}>Cancel</Button>,
                                    <Button danger key="list-cancel-edit" type="primary" onClick={() => {
                                        this.showMessageModal();
                                        this.setState({
                                            "messageEmail": item.seller
                                        })
                                    }}>Notify Seller</Button>
                                ]}>
                                    {/* <List.Item> */}
                                    <List.Item.Meta
                                        title={item.title + "(" + item.category + ")"}
                                        description={item.description}
                                    />
                                    <div style={{ fontWeight: "bold" }}><span style={{ color: "darkred" }}>Price: {item.price}</span>&nbsp; | &nbsp;<span style={{ color: "green" }}>{item.status}</span></div>
                                </List.Item>
                            )}
                        />
                    </Card>
                    <Modal title="Basic Modal" visible={this.state.reviewVisible} onOk={this.handleOk} onCancel={this.handleCancel}>
                        <TextArea maxLength={500} onChange={this.onReviewChange}></TextArea>
                    </Modal>

                    <Modal title="Message" width="300" visible={this.state.messageModal} onOk={this.handleMessageOk} onCancel={this.handleMessageCancel}>
                        <Message email={this.state.messageEmail}></Message>
                    </Modal>

                </>
            )
        }
    }
}