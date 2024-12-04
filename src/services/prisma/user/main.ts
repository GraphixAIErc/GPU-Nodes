import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient();

export const createUser = async (publicAddress: string) => {
    let user = await prisma.user.findUnique({ where: { publicAddress } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                nonce: Math.floor(Math.random() * 10000),
                publicAddress,
                username: "",
                email: "",
            },
        });
    }
    return {
        nonce: user.nonce,
        publicAddress: user.publicAddress,
    };
};

export const updateUsername = async (userId: string, username: string) => {
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { username },

    });
    return updatedUser
}

export const updateSSHPublicKey = async (userId: string, sshPublicKey: string) => {
    return await prisma.user.update({
        where: { id: userId },
        data: { sshPublicKey }
    });

}


export const getUser = async (publicAddress: string) => {
    const user = await prisma.user.findUnique({
        where: { publicAddress }, select: {
            id: true,
            email: true,
            username: true,
            publicAddress: true,
            nonce: true,
            balance: true,
            sshPublicKey: true
        },
    });
    return user;
};

export const getUserById = async (userId: string) => {
    return await prisma.user.findUnique({
        where: { id: userId }
    });
}

export const getUserByAddress = async (address: string) => {
  return await prisma.user.findUnique({
    where: { publicAddress: address },
  })
}

export const updateNonce = async (publicAddress: string) => {
    const nonce = Math.floor(Math.random() * 10000);

    const user = await prisma.user.update({
        where: { publicAddress },
        data: { nonce },
    });
    return user;
};

export const updateUserRewardNonce = async (address: string) => {
  const user = await getUserByAddress(address)
  if (!user) {
    throw new Error("User not found")
  }

  const rewardNonce = user.rewardNonce + 1
  await prisma.user.update({
    where: { publicAddress: address },
    data: { rewardNonce },
  })
}

export const updateBalance = async (userId: string, type: "ADD" | "MINUS", amount: number) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error("User not found");
    }
    let currentBalance = user.balance || 0;
    if (type === "ADD") currentBalance += amount
    else if (type === "MINUS") currentBalance -= amount
    else throw new Error("Invalid type")

    return await prisma.user.update({
        where: { id: userId },
        data: { balance: currentBalance }
    });
}