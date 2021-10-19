class IntersectionObserver{
    constructor(options){
        this.$options = {
            context:null,
            threshold:0.5,
            initialRatio:0,
            observeAll:false,
            selector:null,
            relativeTo:null,
            onEach:res=>res.dataset,
            onFinal:()=>null,
            delay:200,
            ...options
        }
        this.$observer = null // 监听器
        this.$exposured = {}  // 用于存储已曝光的埋点  
    }

    _createObserver(){
        const opt = this.$options
        const observerOptions = {
            thresholds:[opt.threshold],
            observeAll:opt.observeAll,
            initialRatio:opt.initialRatio
        }
        const ob = opt.context?opt.context.createIntersectionObserver(observerOptions):wx.createIntersectionObserver(null,observerOptions)

        if(opt.relativeTo)
            ob.relativeTo(opt.relativeTo)
        else
            ob.relativeToViewport()

        let finalData =[]
        let isCollecting = false
        ob.observe(opt.selector,res=>{
            const {intersectionRatio} = res
            const visible = intersectionRatio > opt.threshold
            if(!visible){
                return
            }
            const data = opt.onEach(res)
            if(this.$exposured[data.id])return
            this.$exposured[data.id] = true
            finalData.push(data)
            if(isCollecting)return
            isCollecting = true

            setTimeout(()=>{
                opt.onFinal.call(null,finalData)
                finalData = []
                isCollecting = false
            },opt.delay)
        })
        return ob
    }

    connect(options){
        if(options){
            this.$options = options
        }
        if(this.$observer){
            this.disconnect()
            this.$observer = null
        }
        this.$observer = this._createObserver()
        return this
    }

    disconnect(){
        if(!this.$observer) return
        const ob = this.$observer
        if(!ob.$timer) clearTimeout(ob.$timer)
        ob.disconnect()
        this.$observer = null
    }
}

export { IntersectionObserver }



