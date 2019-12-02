import React, { Component, useState, useEffect } from 'react';
import { Animated, StyleSheet, Text, View, PanResponder, ProgressBarAndroid, StatusBar } from 'react-native';

const Radius = 50;
const WinnerRadius = 70;
const PointColours = ['#FFFF00', '#0000FF', '#00FF00', '#FF0000', '#FF00FF', '#00FFFF', '#FFFFFF']
const TimeoutMs = 2000;
const UpdateMs = 25;
const WorkaroundTimeoutMs = 1500;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

export default class Project extends Component<{}> {
  constructor()
  {
    super();
    this.panResponder;
    this.state = {
      winner : -1,
      winnerX: -1,
      winnerY: -1,
      touches : [],
      bgcolor: '#FFFFFF',
      progress: 0,
    }
    this.mainTimer = 0;
  }

  randomWinner()
  {
    this.stopTimer();
    let w = getRandomInt(this.state.touches.length);
    let y = parseFloat(this.state.touches[w].locationY.toFixed(2) - WinnerRadius);
    let x = parseFloat(this.state.touches[w].locationX.toFixed(2) - WinnerRadius);
    this.setState({winner: w, winnerX: x, winnerY: y, bgcolor: PointColours[w]});
  }

  stopTimer() {
    clearTimeout(this.mainTimer);
    clearInterval(this.progress);
    this.setState({progress: 0})
  }

  handleTimer() {
    this.stopTimer();
    this.progress = setInterval(() => {this.setState({progress: this.state.progress + UpdateMs})}, UpdateMs);
    this.mainTimer = setTimeout(() => {this.randomWinner();}, TimeoutMs);
  }

  componentWillMount()
  {
    this.panResponder = PanResponder.create(
    {
      onStartShouldSetPanResponder: (event, gestureState) => true,
      onStartShouldSetPanResponderCapture: (event, gestureState) => true,
      onMoveShouldSetPanResponder: (event, gestureState) => false,
      onMoveShouldSetPanResponderCapture: (event, gestureState) => false,
      onPanResponderGrant: (event, gestureState) =>
      {
        this.setState({
          touches: event.nativeEvent.touches,
          bgcolor: '#101010'
        });
      },

      onPanResponderStart : (event) =>
      {
        if(this.state.winner < 0)
          this.handleTimer();
      },

      onPanResponderMove: (event, gestureState) =>
      {
        this.setState({
          touches: event.nativeEvent.touches,
        });
      },

      onPanResponderRelease: (event, gestureState) =>
      {
        this.stopTimer();
        this.setState({
          winner: -1,
          touches: event.nativeEvent.touches,
          bgcolor: '#FFFFFF'
        });
      },

      onPanResponderEnd: (event) =>
      {
        if (this.state.touches && this.state.winner < 0)
          this.handleTimer();
      }
    });
  }


  renderTouches(touches)
  {
    if (this.state.winner >= 0) {
      return (<View style = {[ styles.winPoint,
          { top: this.state.winnerY + 10, left: this.state.winnerX}]} key={this.state.winner} />);
    }

    if (touches) {
      let y = (item) => parseFloat(item.locationY.toFixed(2) - Radius + 10);
      let x = (item) => parseFloat(item.locationX.toFixed(2) - Radius);
      return touches.map((item, index) =>
        <View style = {[ styles.point,
          { backgroundColor: PointColours[index], top: y(item), left: x(item)}]} key={index} />);
    }
    return null;
  }

  render()
  {
    return (
      <View style={[styles.mainView, {backgroundColor: this.state.bgcolor}]}>
        <StatusBar hidden/>
        <View style = {[styles.progressBar, { transform: [{ rotate: "180deg" }] }]} >
          <ProgressBarAndroid
            styleAttr="Horizontal"
            indeterminate={false}
            progress={this.state.progress/(WorkaroundTimeoutMs)}
          />
        </View>
        {this.renderTouches(this.state.touches)}
        <View style = {{ flex: 1, backgroundColor: 'transparent' }}  { ...this.panResponder.panHandlers } />
        <View style = {styles.progressBar} >
          <ProgressBarAndroid
            styleAttr="Horizontal"
            indeterminate={false}
            progress={this.state.progress/(WorkaroundTimeoutMs)}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: '#263238',
    overflow: 'hidden',
  },

  point: {
    height: 2*Radius,
    width: 2*Radius,
    position: 'absolute',
    borderRadius: Radius,
    backgroundColor: '#FF3D00',
  },

  winPoint: {
    height: 2*WinnerRadius,
    width: 2*WinnerRadius,
    position: 'absolute',
    borderRadius: WinnerRadius,
    backgroundColor: '#101010',
  },
  progressBar: {
    flex: 0,
    height: 10,
  }
});
