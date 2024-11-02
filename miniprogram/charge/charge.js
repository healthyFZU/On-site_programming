// pages/charge/charge.js
const db = wx.cloud.database();
var util = require("../../utils/util");
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    categroy: [
      { text: '餐饮', value: 0 },
      { text: '交通', value: 1 },
      { text: '通讯', value: 2 },
      { text: '购物', value: 3 },
      { text: '日用', value: 4 },
      { text: '住房', value: 5 },
      { text: '医疗', value: 6 },
      { text: '美容', value: 7 },
      { text: '理发', value: 8 },
      { text: '学习', value: 9 },
      { text: '宠物', value: 10 },
      { text: '礼金', value: 11 },
      { text: '维修', value: 12 },
      { text: '其他', value: 13 },
    ],
    categroyIndex: 0,
    payment: [
      { text: '微信', value: 0 },
      { text: '支付宝', value: 1 },
      { text: '银行卡', value: 2 },
      { text: '校园卡', value: 3 },
    ],
    paymentIndex: 0,
    array: ['餐饮', '交通', '通讯', '购物', '日用', '住房', '医疗', '美容', '理发', '学习', '宠物', '礼金', '维修', '其他'],
    index: 0,
    date: "",
    form_info: ""
  },
  
  onLoad: function (options) {
    var DATE = util.formDate(new Date());
    this.setData({
      date: DATE,
    });
  },

  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      index: e.detail.value
    });
  },

  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      date: e.detail.value
    });
  },

  formSubmit: function (res) {
    this.setData({
        form_info: ""
    });
    
    let cost = res.detail.value.hf;
    let bzcd = res.detail.value.bz;
    let category = this.data.array[this.data.index]; // 获取选择的分类
    let date = this.data.date; // 获取日期

    if (cost == '') {
        Dialog.alert({
            message: '请输入价格',
        });
        return null;
    }

    const exp = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
    if (!exp.test(cost)) {
        Dialog.alert({
            message: '请输入正确的金额',
        });
        return null;
    }

    if (bzcd.length > 16) {
        Dialog.alert({
            message: '备注太长啦！',
        });
        return null;
    }

    // 将数据格式化为 CSV 行
    const csvData = `${date},${cost},${category},${bzcd}\n`;

    // 获取文件系统管理器
    const fs = wx.getFileSystemManager();
    
    // 指定文件路径
    const filePath = wx.env.USER_DATA_PATH + '/expenses.csv';

    // 尝试写入文件
    fs.access({
        path: filePath,
        success: () => {
            // 如果文件存在，则追加数据
            fs.appendFile({
                filePath: filePath,
                data: csvData,
                encoding: 'utf8',
                success: () => {
                    wx.showToast({
                        title: '保存成功',
                        icon: 'success'
                    });
                },
                fail: (err) => {
                    console.error('写入失败', err);
                }
            });
        },
        fail: () => {
            // 如果文件不存在，则创建新文件
            fs.writeFile({
                filePath: filePath,
                data: '日期,金额,类别,备注\n' + csvData, // 写入表头和数据
                encoding: 'utf8',
                success: () => {
                    wx.showToast({
                        title: '保存成功',
                        icon: 'success'
                    });
                },
                fail: (err) => {
                    console.error('写入失败', err);
                }
            });
        }
    });
}

});
