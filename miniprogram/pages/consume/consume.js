const db = wx.cloud.database()
var util = require("../../utils/util")
const app =getApp()
var wxCharts = require('../../utils/wxcharts-min.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    day: [
      { day: '今天', expense: '0.00', income: '0.00', balance: '0.00' },
      { day: '昨天', expense: '0.00', income: '0.00', balance: '0.00' },
      { day: '03', expense: '0.00', income: '0.00', balance: '0.00' },
      { day: '02', expense: '0.00', income: '0.00', balance: '0.00' },
      { day: '01', expense: '0.00', income: '0.00', balance: '0.00' },
      // 添加其他月份数据
      // 继续添加更多数据...
    ],
    displayedCount: 2 // 当前显示的行数
  },
  
  showMore: function() {
    const newCount = this.data.displayedCount + 2; // 每次增加两行
    this.setData({
      displayedCount: newCount
    });
  },
  onAdd: function () {
    wx.cloud.callFunction({
      name: 'login'
    })
    //如果该opendid不存在,则加入
    db.collection("monBudget").where({ _openid:app.globalData.openid}).get().then(
      res=>{
        console.log(app.globalData.openid,"=====================",res)
       if(res.data.length==0){
        db.collection("monBudget").add({
          data:{
            budget:0
          }
        })
       }
      }
    )
   
  },

  btnSub(res) {
    wx.cloud.callFunction({
      name: 'login'
    })
    let resValue = res.detail.value
    console.log("resValue",resValue)
    db.collection("monBudget").where({ _openid:app.globalData.openid}).get().then(
      res=>{
       if(res.data.length==0){
        db.collection("monBudget").add({
          data:{
            budget:resValue.budget
          }
        })
       }else{
        db.collection("monBudget").where({
          _openid: app.globalData.openid
        }).update({
          data:resValue
        }).then(res => {
          console.log(res)
        })
       }
      }
    )

    this.getall();
  },
  //获取全部
  getall: function () {
    var num = this.data.Number
    var that = this
    db.collection('allCost').count().then(res => {
      num = res.total
      this.setData({
        Number: num
      })
      this.setData({
        usagePercentage:100
      })
      const batchTimes = Math.ceil(this.data.Number / 20) //计算需要获取几次  比如你有36条数据就要获取两次 第一次20条第二次16条
      let arraypro = [] // 定义空数组 用来存储每一次获取到的记录 
      let x = 0 //这是一个标识每次循环就+1 当x等于batchTimes 说明已经到了最后一次获取数据的时候
      for (let i = 0; i < batchTimes; i++) {
        db.collection('allCost').skip(i * 20).get().then(res => {
          x += 1
          for (let j = 0; j < res.data.length; j++) {
            arraypro.push(res.data[j])
          }
          if (x == batchTimes) {
            this.setData({
              List: arraypro
            })
          }
          var dayspend = 0; //今日消费
          var monthspend = 0; //本月消费
          var avgSpendPerDay = 0; //日均消费
         
          //已消费
          var allList = this.data.List;
          var DATE = util.formDate(new Date());

          for (var i in allList) {
            //今日消费
            //当日期等于今天时,累加
            if (allList[i].rq == DATE && allList[i].hf != "") {
              dayspend = dayspend + parseFloat(allList[i].hf)
            }
            //本月消费
            //当年份和月份对应相同时
            if (allList[i].rq.substring(0, 7) == DATE.substring(0, 7) && allList[i].hf != "") {
              monthspend = monthspend + parseFloat(allList[i].hf)
            }

          }
          //日均消费
          avgSpendPerDay = monthspend / parseInt(DATE.substring(8, 10))
        var monthLeftDay = 0; //本月剩余天数
        var DATE = util.formDate(new Date())
        var year = parseInt(DATE.substring(0, 4))
        var month = parseInt(DATE.substring(5, 7))
        var day = parseInt(DATE.substring(8, 10))
        console.log(year, "-----", month, "-----", day)
        switch (month) {
          case 1:
          case 3:
          case 5:
          case 7:
          case 8:
          case 10:
          case 12:
            monthLeftDay = 31 - day;
            break;
          case 2:
            if ((year % 400 == 0) || (year % 4 == 0 && year % 100 != 0)) {
              //是闰年,2月有29天
              monthLeftDay = 29 - day;
              break;
            } else {
              monthLeftDay = 28 - day;
              break;
            }
            case 4:
            case 6:
            case 9:
            case 11:
              monthLeftDay = 30 - day;
              break;
            default:
              console.log("此月份error!");
              break;
        }
         this.setData({
          monthLeftDay: monthLeftDay, //本月剩余天数
        })


        var dayAvgAvailable = 0;//日均可用
        var monthAvailable = 0;//本月剩余
        
        var usagePercentage=0;//使用比例
        var isOverSpend=false;//是否超支
        db.collection("monBudget").get().then(res => {
            //本月剩余
            monthAvailable = res.data[0].budget - monthspend;
            //日均可用
            // dayAvgAvailable=(monthAvailable/monthLeftDay)>=0?(monthAvailable/monthLeftDay):0;
            if(monthLeftDay !=0){
              dayAvgAvailable=(monthAvailable/monthLeftDay)>=0?(monthAvailable/monthLeftDay):0;
              }else{
                dayAvgAvailable=monthAvailable>=0?monthAvailable:0;
              }
  
             this.setData({
               budget:res.data[0].budget
             })
             //是否超支
             if(monthAvailable<=0){
               isOverSpend=true; 
               usagePercentage=100;
             }else{
               usagePercentage=(1-(monthAvailable/this.data.budget) ).toFixed(3)*100;
             }
             this.setData({
               isOverSpend: isOverSpend,
               usagePercentage:usagePercentage.toFixed(2),
              monthAvailable: monthAvailable.toFixed(2),
              dayAvgAvailable:dayAvgAvailable.toFixed(2)
            })
          })
          this.setData({
            todaySpend: dayspend.toFixed(2),
            monthSpend: monthspend.toFixed(2),
            avgSpendPerDay: avgSpendPerDay.toFixed(2)
          })
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getall();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.onAdd();
    this.getall();
   
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getall();
    
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getall();
  }
})
