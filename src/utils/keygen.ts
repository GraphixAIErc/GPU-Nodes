import forge from 'node-forge';

export const generateKeyPair = (userId: string) => {
    const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair(2048);
    const sshPublicKey = forge.ssh.publicKeyToOpenSSH(publicKey, `${userId}@localhost`);
    const sshPrivateKey = forge.ssh.privateKeyToOpenSSH(privateKey);

    const KeyFingerprint = forge.md.md5.create().update(sshPublicKey).digest().toHex();

    return {
        publicKey:sshPublicKey,
        KeyMaterial: sshPrivateKey,
        KeyFingerprint,
        KeyName: `${userId}-${Date.now()}`
    };
};