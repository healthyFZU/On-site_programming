// pages/report/report.js
var util = require("../../utils/util");
var wxCharts = require('../../utils/wxcharts-min.js');
var app = getApp();

var columnChart = null;

Page({
  data: {
    img1: 'cloud://cloud1-7gko5ynq797bcfa6.636c-cloud1-7gko5ynq797bcfa6-1305669469/canying.png', // 假设图片存放在项目的images目录下
    array1: ['', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'],
    array2: ['', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'],
    array3: ['', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29'],
    array4: ['', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28'],
    chartTitle: '月消费报表',
    chartQTtitle: '七日支出',
    head0: 'head_item head_itemActive',
    head1: 'head_item',
    Number: 0,
    CYlist: '',
    Cprice: 0,
    JTList: "",
    TXList: "",
    ShoppingList: "",
    QTList: "",
    ShoppingPrice: 0,
    JTPrice: 0,
    QTPrice: 0,
    TXPrice: 0,
    Fmax: 0,
    List: [], // 查询到的所有信息列表
    date: '', // 当前月份
    allcost: 0,
    day: '', // 当天日期
    dayList: [], // 七天数组
    dayCost: [], // 七天花费
    flagcolumn: false, // 是否画柱状图
    flagpie: false, // 是否画饼图
    dd: '', // 当天天数 例如26号
    month: '', // 当前月份 例如05
    year: '' // 当前年份
  },

  onLoad: function (e) {
    var DATE = util.formMonth(new Date());
    var d = util.formDate(new Date());
    var dd = d.slice(8, 11);
    var month = DATE.slice(5, 7);
    var year = DATE.slice(0, 4);

    if ((parseInt(year) % 400 == 0) || (parseInt(year) % 4 == 0 && parseInt(year) % 100 != 0)) {
      year = 'r';
    } else {
      year = 'p';
    }

    console.log(this.data.date);
    console.log(this.data.dd);
    console.log(this.data.month);
    console.log(this.data.year);

    this.setData({
      date: DATE,
      day: d,
      dd: dd, // 当前天数例如23号
      month: month,
      year: year
    });

    this.getallData();
  },

  onShow: function () {
    var DATE = util.formMonth(new Date());
    var d = util.formDate(new Date());
    var dd = d.slice(8, 11);
    var month = DATE.slice(5, 7);
    var year = DATE.slice(0, 4);

    if ((parseInt(year) % 400 == 0) || (parseInt(year) % 4 == 0 && parseInt(year) % 100 != 0)) {
      year = 'r';
    } else {
      year = 'p';
    }

    this.setData({
      date: DATE,
      day: d,
      dd: dd, // 当前天数例如23号
      month: month,
      year: year,
      flagcolumn: false
    });

    this.getallData();
  },

  getallData: function() {
    // 使用静态数据
    const staticData = [
      { rq: '2024-11-01', fl: '0', hf: 100, bz: '餐饮' },
      { rq: '2024-11-02', fl: '1', hf: 50, bz: '交通' },
      { rq: '2024-11-03', fl: '2', hf: 200, bz: '购物' },
      // 更多静态数据...
    ];

    let Clist = [], JList = [], TList = [], SList = [], QList = [], Cprice = 0, Jprice = 0, Tprice = 0, Sprice = 0, Qprice = 0;
    for (let i in staticData) {
      if (staticData[i].rq.slice(0, 7) == this.data.date) {
        let list = staticData[i];
        if (staticData[i].fl == '0') {
          Clist.push(list);
          Cprice += parseFloat(staticData[i].hf);
        }
        if (staticData[i].fl == '1') {
          JList.push(list);
          Jprice += parseFloat(staticData[i].hf);
        }
        if (staticData[i].fl == '2') {
          TList.push(list);
          Tprice += parseFloat(staticData[i].hf);
        }
        if (staticData[i].fl == '3') {
          SList.push(list);
          Sprice += parseFloat(staticData[i].hf);
        }
        if (staticData[i].fl == '4') {
          QList.push(list);
          Qprice += parseFloat(staticData[i].hf);
        }
      }
    }

    var allcost = Cprice + Tprice + Qprice + Jprice + Sprice;

    this.setData({
      List: staticData,
      CYlist: Clist,
      Cprice: Cprice,
      JTList: JList,
      JTPrice: Jprice,
      TXList: TList,
      TXPrice: Tprice,
      ShoppingList: SList,
      ShoppingPrice: Sprice,
      QTList: QList,
      QTPrice: Qprice,
      allcost: allcost,
      flagpie: true
    });

    console.log(this.data.CYlist);
    console.log(this.data.JTList);
    console.log(this.data.TXList);
    console.log(this.data.ShoppingList);
    console.log(this.data.QTList);

    this.Paint();
  },

  paintcolumn: function() {
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    new wxCharts({
      canvasId: 'columnCanvas',
      type: 'column',
      animation: true,
      categories: this.data.dayList,
      series: [{
        name: '每日消费',
        data: this.data.dayCost,
        format: function (val, name) {
          return val.toFixed(2) + '元';
        }
      }],
      yAxis: {
        format: function (val) {
          return val + '元';
        },
        title: '花费（元）',
        min: 0
      },
      xAxis: {
        disableGrid: false,
        type: 'calibration'
      },
      extra: {
        column: {
          width: 15
        }
      },
      width: windowWidth,
      height: 300,
    });
  },

  Paint: function() {
    var windowWidth = 320;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }
    new wxCharts({
      animation: true,
      canvasId: 'pieCanvas',
      type: 'pie',
      series: [{
        name: '购物',
        data: this.data.ShoppingPrice,
      }, {
        name: '餐饮',
        data: this.data.Cprice,
      }, {
        name: '交通',
        data: this.data.JTPrice,
      }, {
        name: '通讯',
        data: this.data.TXPrice,
      }, {
        name: '其他',
        data: this.data.QTPrice,
      }],
      width: windowWidth,
      height: 300,
      dataLabel: true,
    });
  },

  Num: function() {
    var num = this.data.Number;
    this.setData({
      Number: num
    });
  },

});