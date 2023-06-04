import React, { CSSProperties, useEffect, useRef } from 'react'

export interface Data {
  name: string
  value: number
  color: string
}

interface PieChartProps {
  data: Data[]
  width: number
  height: number
  radius: [number, number] | number
  spacing?: boolean
  style?: CSSProperties
  className?: string
}

enum Direction {
  TOP_LEFT = 'topLeft',
  TOP_RIGHT = 'topRight',
  BOTTOM_RIGHT = 'bottomRight',
  BOTTOM_LEFT = 'bottomLeft',
  NO_POSTION = 'noPostion',
}

type DrawArcProps = (
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  radius: number,
  startPostion: number,
  endPostion: number,
) => void

const drawArc: DrawArcProps = (ctx, color, x, y, radius, startPostion, endPostion) => {
  if (ctx) {
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.strokeStyle = color
    ctx.moveTo(x, y)
    ctx.arc(x, y, radius, startPostion, endPostion)
    ctx.fill()
    ctx.closePath()
  }
}

const findDeirection = (angel: number): string => {
  const { TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT, NO_POSTION } = Direction
  let direction = NO_POSTION
  while (angel >= 1.5 * Math.PI) {
    angel -= 2 * Math.PI
  }
  if (angel >= -Math.PI * 0.5 && angel < 0) {
    direction = TOP_RIGHT
  } else if (angel >= 0 && angel < 0.5 * Math.PI) {
    direction = BOTTOM_RIGHT
  } else if (angel >= 0.5 * Math.PI && angel < Math.PI) {
    direction = BOTTOM_LEFT
  } else if (angel >= Math.PI && angel < Math.PI * 1.5) {
    direction = TOP_LEFT
  } else {
    direction = NO_POSTION
  }
  return direction
}
/**
 * 绘制一个饼图
 * @param data 数据
 * @param width 容器宽度
 * @param height 容器高度
 * @param radius 基于容器高度和宽度的最小值设置百分比半径，可设置内环和外环，也可只设置外环
 * @param radius 饼图item之间是否存在间隙，默认为true
 * @returns
 */
const CanvasPie: React.FC<PieChartProps> = ({ data, width, height, radius, spacing = true }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT } = Direction
  // 将Canvas画布绘制宽高设置为css宽高的2倍
  const doubleWidth = width * 2
  const doubleHeight = height * 2
  const centerX = width
  const centerY = height

  // 判断是否是环形
  const isAnnular = typeof radius === 'number'

  const THRESHOLD = 0.1 * Math.PI

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        const total = data.reduce((sum, item) => sum + item.value, 0)
        let radiusCircle = Math.floor((isAnnular ? radius : radius[1]) * Math.min(width, height))

        const sperateAngle = 0.015 * Math.PI
        let startAngle = -0.5 * Math.PI

        const pieCircle: [string, number, number, number][] = []
        const textInfo: [number, number, string, string][] = []

        // 将绘制角度进行累加
        let addInner = 0
        // 获取内圈数据
        data.forEach((item) => {
          // 数据全为0则均分饼图
          let arcAngle = total === 0 ? (2 / data.length) * Math.PI : (item.value / total) * 2 * Math.PI
          let endAngle = arcAngle + startAngle
          let midAngle = (startAngle + endAngle) / 2
          textInfo.push([arcAngle, midAngle, item.name, item.color])
          addInner += arcAngle < THRESHOLD ? 0.2 * Math.PI : arcAngle
          pieCircle.push([item.color, startAngle, endAngle, endAngle - sperateAngle])
          startAngle = endAngle
        })
        const transfromPra = (2 * Math.PI) / addInner

        // 将饼图绘制的起点设置为12点方向
        startAngle = -0.5 * Math.PI
        textInfo.forEach((item) => {
          let endAngle = (item[0] < THRESHOLD ? 0.2 * Math.PI : item[0]) * transfromPra + startAngle
          let midAngle = (startAngle + endAngle) / 2
          let textX = centerX + Math.cos(midAngle) * radiusCircle * 1.12
          let textY = centerY + Math.sin(midAngle) * radiusCircle * 1.12
          // 绘制到文本的直线
          context.beginPath()
          context.strokeStyle = item[3]
          context.lineWidth = 2
          context.moveTo(
            centerX + Math.cos(item[1]) * radiusCircle * 1.02,
            centerY + Math.sin(item[1]) * radiusCircle * 1.02,
          )
          context.lineTo(textX, textY)
          context.stroke()

          // 根据位置绘制文本和横线
          const direction = findDeirection(midAngle)
          context.font = '16px Arial'
          if (direction === TOP_LEFT) {
            context.lineTo(textX - 0.1 * radiusCircle, textY)
            context.stroke()
            context.fillStyle = '#000'
            context.textAlign = 'right'
            context.fillText(item[2], textX, textY - 0.02 * radiusCircle)
          } else if (direction === TOP_RIGHT) {
            context.lineTo(textX + 0.1 * radiusCircle, textY)
            context.stroke()
            context.fillStyle = '#000'
            context.textAlign = 'left'
            context.fillText(item[2], textX, textY - 0.02 * radiusCircle)
          } else if (direction === BOTTOM_LEFT) {
            context.lineTo(textX - 0.1 * radiusCircle, textY)
            context.stroke()
            context.fillStyle = '#000'
            context.textAlign = 'right'
            context.fillText(item[2], textX, textY - 0.02 * radiusCircle)
          } else if (direction === BOTTOM_RIGHT) {
            context.lineTo(textX + 0.1 * radiusCircle, textY)
            context.stroke()
            context.fillStyle = '#000'
            context.textAlign = 'left'
            context.fillText(item[2], textX, textY - 0.02 * radiusCircle)
          }
          context.closePath()

          startAngle = endAngle
        })
        // 绘制扇形区域
        pieCircle.forEach((item) => {
          drawArc(context, item[0], centerX, centerY, radiusCircle, item[1], item[2])
          if (spacing) {
            // 绘制白色边界
            context.save()
            // 默认旋转点是canvas的左上角(0,0)
            // 如果希望改变旋转中心点，以canvas画布的中心旋转，需要使用translate()位移旋转中心
            context.translate(centerX, centerY)
            context.rotate(item[1])
            context.translate(-centerX, -centerY)
            context.fillStyle = '#fff'
            context.fillRect(centerX, centerY, radiusCircle + 2, Math.floor(0.02 * radiusCircle))
            context.restore()
          }
        })
        !isAnnular && drawArc(context, '#fff', centerX, centerY, 40, 0, 2 * Math.PI)
      }
    }
  }, [data])
  return (
    <canvas
      ref={canvasRef}
      width={doubleWidth}
      height={doubleHeight}
      style={{ width: `${width}px`, height: `${height}` }}
    />
  )
}
export default CanvasPie
