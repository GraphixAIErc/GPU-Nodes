import { getHourlyPrice } from "@/services/aws/intances";
import { prisma } from "../main"

export const saveInstance = async (userId: string, data: any) => {

    return await prisma.instance.create({
        data: {
            instanceId: data.instanceId,
            instanceTypeId: data.instanceTypeId,
            keyName: data.keyName,
            userId: userId,
            expireAt: data.expireAt,
            publicIp: data.publicIp
        }
    });
}



export const updatePublicIpAddress = async (instanceId: string, publicIp: string) => {
    return await prisma.instance.update({
        where: {
            instanceId: instanceId
        },
        data: {
            publicIp: publicIp,
            status: "running"
        }
    });
}

export const fetchRunningInstances = async () => {
    return await prisma.instance.findMany({
        where: {
            status: {
                in: ["running", "pending"]
            }
        }
    });
}

export const updateInstance = async (instanceId: string, payload: any) => {
    return await prisma.instance.update({
        where: {
            id: instanceId
        },
        data: payload
    });
}


export const fetchMyInstances = async (userId: string) => {

    return await prisma.instance.findMany({
        where: {
            userId: userId
        },
        include: {
            instanceType: true
        }
    });

}


// --------------
// Instsance Type
// --------------


export const fetchInstanceByType = async (type: string) => {

    return prisma.instanceType.findFirst({
        where: {
            type: type
        }
    });



}

export const saveInstanceType = async (instance: any, price: number) => {

    const data = await prisma.instanceType.create({
        data: {
            type: instance.type,
            cpu: {
                name: instance.cpu.Name,
                cores: instance.cpu.Cores,
                clockSpeedGHz: instance.cpu.ClockSpeedGHz
            },
            gpu: {
                name: instance.gpu.Name,
                count: instance.gpu.Count,
                totalMemoryMiB: instance.gpu.TotalMemoryMiB
            },
            network: {
                speed: instance.networkSpeed
            },
            storage: {
                totalGB: instance.totalStorageGB
            },
            price: price
        }
    });

    return data;
}


export const fetchAllInstanceTypes = async () => {

    return prisma.instanceType.findMany({});

}


// --------------
// KEY PAIR
// --------------

export const saveKeyPair = async (userId:string, instanceId: string, keyPair: any) => {


    // return await prisma.keyPair.create({
    //     data: {
    //         keyFingerprint: keyPair.KeyFingerprint,
    //         keyMaterial: keyPair.KeyMaterial,
    //         keyName: keyPair.KeyName,
    //         keyPairId: keyPair.KeyPairId ? keyPair.KeyPairId : "",
    //         instanceId: instanceId,
    //         publicKey: keyPair.publicKey ? keyPair.publicKey : "",
    //         userId: userId
    //     }
    // });

}

export const fetchKeyPair = async (userId: string, keyName: string) => {

    const instance = await prisma.instance.findFirst({
        where: {
            keyName: keyName,
            userId: userId
        }
    })
    if (!instance) {
        throw new Error("Instance not found")
    }
    return await prisma.keyPair.findUnique({
        where: {
            keyName: keyName
        }
    });

}


export const testEditFiles = async () => {
    const instanceTypes = await prisma.instanceType.findMany({});
    for (const instanceType of instanceTypes) {

        // const price = await getHourlyPrice(instanceType.type)
        // console.log(instanceType.type + ": " + price)
        //     const randomNetworkSpeed = Math.floor(Math.random() * (50 - 10 + 1) + 10);
        //     const network: any = instanceType.network
        //     // console.log(network)

        //     if (network.speed) {
        //         console.log(network)

        // await prisma.instanceType.update({
        //     where: {
        //         id: instanceType.id
        //     },
        //     data: {
        //         price: parseFloat(price.toFixed(2))
        //     }
        // });



    }

}