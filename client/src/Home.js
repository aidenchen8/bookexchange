import { Card, List, Modal, Button, Descriptions, message, Empty, Input } from "antd";
import React from "react";
import axios from 'axios'
import { url } from "./env";
const { Search } = Input;


export class Home extends React.Component {

    state = {
        list: [],
        total: [],
        isModalVisible: false,
        selectedItem: undefined
    }


    timer=-1;

    componentDidMount = () => {
        this.updateBookList();
        this.timer=window.setInterval(()=>{
            this.updateBookList()
        }, 3000);
    }

    componentWillUnmount = () => {
        clearInterval(this.timer)
    }



    updateBookList = () => {
        axios.get(`${url.base}/list/all?`).then(
            (response) => {
                console.log(response.data);
                this.setState({
                    list: [...response.data].filter(each => each.title != null),
                    total: [...response.data].filter(each => each.title != null)
                });
            }
        ).catch((error) => {
            console.log(error);
        });
    }

    showModal = () => {
        this.setState({ isModalVisible: true });
    };

    handleOk = () => {
        const email = window.localStorage.getItem("email");
        this.setState({ isModalVisible: false });
        axios.get(`${url.base}/lock?buyer=${email}&book=${this.state.selectedItem["_id"]}`).then((response) => {
            if (response.data === "ok") {
                message.info("Lock successfully");
                this.updateBookList();
            } else {
                message.error("Lock failed");
            }
        }).catch((error) => {
            message.error("Lock failed");
        });
    };

    handleCancel = () => {
        this.setState({ isModalVisible: false });
    };

    onSearch = (value) => {
        console.log("search", value);

        const total = [...this.state.total]

        this.setState({
            list: total.filter(each => each.title.toLowerCase().indexOf(value.toLowerCase()) >= 0 || each.category.toLowerCase().indexOf(value.toLowerCase()) >= 0 || (each.author != undefined && each.author.toLowerCase().indexOf(value.toLowerCase()) >= 0) || (each.description != undefined && each.description.toLowerCase().indexOf(value.toLowerCase()) >= 0)),
        });
    }

    render = () => {

        let detail = <></>

        if (this.state.selectedItem != null) {
            detail = <div>
                <Descriptions title="Book Detail" bordered>
                    <Descriptions.Item label="Title">{this.state.selectedItem.title}</Descriptions.Item>
                    <Descriptions.Item label="Category">{this.state.selectedItem.category}</Descriptions.Item>
                    <Descriptions.Item label="Author">{this.state.selectedItem.author}</Descriptions.Item>
                    <Descriptions.Item label="Price">{this.state.selectedItem.price}</Descriptions.Item>
                    <Descriptions.Item label="Description">{this.state.selectedItem.description}</Descriptions.Item>
                    <Descriptions.Item label="Seller">{this.state.selectedItem.seller}</Descriptions.Item>
                    <Descriptions.Item label="Publish Time">{this.state.selectedItem.publishTime}</Descriptions.Item>
                    <Descriptions.Item label="Sold Time">{this.state.selectedItem.soldTime}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                        {this.state.selectedItem.status}
                    </Descriptions.Item>
                    <Descriptions.Item label="Review">
                        {this.state.selectedItem.review}
                    </Descriptions.Item>
                </Descriptions>,
            </div>
        }



        if (window.localStorage.getItem("email") == null) {
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

            return <>
                <Card
                    style={{ minWidth: '355px', margin: "auto" }}
                    title="Books"
                >
                    <Search placeholder="input book/author/keyword/category" onSearch={this.onSearch} enterButton />
                    <List
                        itemLayout="horizontal"
                        dataSource={this.state.list}
                        renderItem={item => (
                            <List.Item actions={[<a key="list-loadmore-edit" onClick={
                                () => {
                                    this.setState({
                                        selectedItem: item
                                    });
                                    this.showModal();
                                }

                            }>detail</a>]}>
                                <List.Item.Meta
                                    title={item.title + "(" + item.category + ")"}
                                    description={[<div>author:{item.author}</div>, <div>description: {item.description}</div>]}
                                />
                                <div style={{ fontWeight: "bold" }}><span style={{ color: "darkred" }}>Price: {item.price}</span>&nbsp; | &nbsp;<span style={{ color: "green" }}>{item.status}</span></div>
                            </List.Item>
                        )}
                    />
                </Card>
                <Modal title="Detail" visible={this.state.isModalVisible} onOk={this.handleOk} onCancel={this.handleCancel} width="1000"
                    footer={[
                        <Button key="buy" type="primary" onClick={this.handleOk} disabled={this.state.selectedItem == undefined || this.state.selectedItem.status !== "available"} >
                            Buy
                        </Button>]}
                >
                    {detail}
                </Modal>
            </>
        }

    }
}