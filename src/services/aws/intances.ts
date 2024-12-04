import { updateInstance, updatePublicIpAddress } from "../prisma/instance";
import { awsEC2, awsPricing } from "./main";




export const createAwsInstance = async (userId: string, type: string) => {

    const keyPairName = `${userId}-${Date.now()}`;
    const keyPair = await awsEC2.createKeyPair({ KeyName: keyPairName }).promise();

    const params = {
        ImageId: 'ami-080660c9757080771',
        InstanceType: type,
        MinCount: 1,
        MaxCount: 1,
        SecurityGroupIds: ['sg-0a6f705f05bb5cf4e'],
        KeyName: keyPair.KeyName,

    };

    const instance = await awsEC2.runInstances(params).promise();
    return { instance, keyPair }
}

export const terminateAwsInstance = async (instance: any) => {

   try{
    const terminatedInstance = await awsEC2.terminateInstances({ InstanceIds: [instance.instanceId] }).promise();
    if (terminatedInstance.TerminatingInstances) {
        console.log(terminatedInstance.TerminatingInstances[0]);
    }
    const deletedKeyPair = await awsEC2.deleteKeyPair({ KeyName: instance.keyName }).promise();

    updateInstance(instance.id, { status: "terminated" });

    return true;
   }catch(e){
    return false
}

}



export const fetchAllAwsInstances = async () => {
    let nextToken = null;
    const instances = [];

    do {
        // Filters: [{ Name: 'instance-type', Values: ['t2*', 't3*', 'g3s*', 'g4dn*', 'g4ad*', 'g5*', 'p2*', 'p3*', 'p4*'] }],

        const response: any = await awsEC2.describeInstanceTypes({
            NextToken: nextToken
        }).promise();

        instances.push(...response.InstanceTypes);
        nextToken = response.NextToken;
    } while (nextToken);

    const gpuInstanceDetails = instances
        .filter(it => it.GpuInfo && it.GpuInfo.Gpus.length > 0)
        .map(instance => {
            console.log(instance)
            return {
                type: instance.InstanceType,
                cpu: {
                    Name: instance.ProcessorInfo.Manufacturer,
                    Cores: instance.VCpuInfo.DefaultCores,
                    ClockSpeedGHz: instance.ProcessorInfo.SustainedClockSpeedInGhz
                },
                gpu: {
                    Name: instance.GpuInfo.Gpus.map((gpu: any) => {
                        return `${gpu.Manufacturer} ${gpu.Name}`
                    }).join(", "),
                    Count: instance.GpuInfo.Gpus.length,
                    TotalMemoryMiB: instance.GpuInfo.TotalGpuMemoryInMiB
                },
                networkSpeed: instance.NetworkInfo.NetworkPerformance,
                totalStorageGB: instance.InstanceStorageSupported && instance.InstanceStorageInfo ? instance.InstanceStorageInfo.TotalSizeInGB : 0
            }
        });

    return gpuInstanceDetails;
}



export const fetchInstanceType = async (params: any) => {
    return await awsEC2.describeInstanceTypes(params).promise();

}


export const fetchInstanceStatus = async (instanceId: string) => {
    try {
        await awsEC2.waitFor('instanceRunning', { InstanceIds: [instanceId] }).promise();

        const updatedInstance = await awsEC2.describeInstances({ InstanceIds: [instanceId] }).promise();
        const instanceDetails = updatedInstance.Reservations?.[0]?.Instances?.[0];
        // console.log(instanceDetails)
        const publicIp = instanceDetails?.PublicIpAddress ?instanceDetails?.PublicIpAddress: "";
      await updatePublicIpAddress(instanceId, publicIp)
        return instanceDetails
    } catch (e) {
        console.log(e)
        return null
    }
}


export const getHourlyPrice = async (instanceType:string) => {
    const params = {
      ServiceCode: 'AmazonEC2',
      Filters: [
        {
          Type: 'TERM_MATCH',
          Field: 'instanceType',
          Value: instanceType
        },
        {
          Type: 'TERM_MATCH',
          Field: 'location',
          Value: 'US East (N. Virginia)' // Change as needed
        },
        {
          Type: 'TERM_MATCH',
          Field: 'operatingSystem',
          Value: 'Linux' // Change as needed
        },
        {
          Type: 'TERM_MATCH',
          Field: 'preInstalledSw',
          Value: 'NA'
        },
        {
          Type: 'TERM_MATCH',
          Field: 'tenancy',
          Value: 'Shared'
        },
        {
          Type: 'TERM_MATCH',
          Field: 'capacitystatus',
          Value: 'Used'
        }
      ]
    };
  
    try {
        const data = await awsPricing.getProducts(params).promise();
        // console.log(data);
        const priceItems:any = data.PriceList?.[0];
      //  console.log(priceItems.terms.OnDemand);
         const onDemandPrice = priceItems.terms.OnDemand[Object.keys(priceItems.terms.OnDemand)[0]];
        const priceDimensions = onDemandPrice.priceDimensions[Object.keys(onDemandPrice.priceDimensions)[0]];
         const pricePerUnit = priceDimensions.pricePerUnit.USD;

        return parseFloat(pricePerUnit);
    } catch (error) {
        console.error(error);
        return 0
    }
  };







// {
//     AmiLaunchIndex: 0,
//     ImageId: 'ami-080660c9757080771',
//     InstanceId: 'i-0a110773ae8bb9a19',
//     InstanceType: 't2.micro',
//     KeyName: 'clw8vicdd000010ccg5v3ymra-1716846417063',
//     LaunchTime: 2024-05-27T21:46:59.000Z,
//     Monitoring: { State: 'disabled' },
//     Placement: {
//       AvailabilityZone: 'ap-southeast-2a',
//       GroupName: '',
//       Tenancy: 'default'
//     },
//     PrivateDnsName: 'ip-172-31-40-101.ap-southeast-2.compute.internal',
//     PrivateIpAddress: '172.31.40.101',
//     ProductCodes: [],
//     PublicDnsName: 'ec2-13-236-36-29.ap-southeast-2.compute.amazonaws.com',
//     PublicIpAddress: '13.236.36.29',
//     State: { Code: 16, Name: 'running' },
//     StateTransitionReason: '',
//     SubnetId: 'subnet-0d286e296e2c7d25c',
//     VpcId: 'vpc-0e71db3a4158da096',
//     Architecture: 'x86_64',
//     BlockDeviceMappings: [ { DeviceName: '/dev/sda1', Ebs: [Object] } ],
//     ClientToken: '727fbb8c-f15c-49b7-936a-6bbca3f6dc67',
//     EbsOptimized: false,
//     EnaSupport: true,
//     Hypervisor: 'xen',
//     ElasticGpuAssociations: [],
//     ElasticInferenceAcceleratorAssociations: [],
//     NetworkInterfaces: [
//       {
//         Association: [Object],
//         Attachment: [Object],
//         Description: '',
//         Groups: [Array],
//         Ipv6Addresses: [],
//         MacAddress: '06:ea:6d:a0:98:bd',
//         NetworkInterfaceId: 'eni-039dea5d30e8ddfff',
//         OwnerId: '533267053690',
//         PrivateDnsName: 'ip-172-31-40-101.ap-southeast-2.compute.internal',
//         PrivateIpAddress: '172.31.40.101',
//         PrivateIpAddresses: [Array],
//         SourceDestCheck: true,
//         Status: 'in-use',
//         SubnetId: 'subnet-0d286e296e2c7d25c',
//         VpcId: 'vpc-0e71db3a4158da096',
//         InterfaceType: 'interface',
//         Ipv4Prefixes: [],
//         Ipv6Prefixes: []
//       }
//     ],
//     RootDeviceName: '/dev/sda1',
//     RootDeviceType: 'ebs',
//     SecurityGroups: [ { GroupName: 'default', GroupId: 'sg-0a6f705f05bb5cf4e' } ],
//     SourceDestCheck: true,
//     Tags: [],
//     VirtualizationType: 'hvm',
//     CpuOptions: { CoreCount: 1, ThreadsPerCore: 1 },
//     CapacityReservationSpecification: { CapacityReservationPreference: 'open' },
//     HibernationOptions: { Configured: false },
//     Licenses: [],
//     MetadataOptions: {
//       State: 'applied',
//       HttpTokens: 'required',
//       HttpPutResponseHopLimit: 2,
//       HttpEndpoint: 'enabled',
//       HttpProtocolIpv6: 'disabled',
//       InstanceMetadataTags: 'disabled'
//     },
//     EnclaveOptions: { Enabled: false },
//     BootMode: 'uefi-preferred',
//     PlatformDetails: 'Linux/UNIX',
//     UsageOperation: 'RunInstances',
//     UsageOperationUpdateTime: 2024-05-27T21:46:59.000Z,
//     PrivateDnsNameOptions: {
//       HostnameType: 'ip-name',
//       EnableResourceNameDnsARecord: false,
//       EnableResourceNameDnsAAAARecord: false
//     },
//     MaintenanceOptions: { AutoRecovery: 'default' },
//     CurrentInstanceBootMode: 'legacy-bios'
//   }
  



// var params = {
//     InstanceTypes: ['t2.micro']
// };

// const data = await fetchInstanceType(params)

// export const fetchAllInstances = async () => {

//     const params: AWS.EC2.DescribeInstanceTypesRequest = {
//         Filters: [
//             {
//                 Name: 'processor-info.supported-architecture', // Assumes GPU instances are on specific architectures
//                 Values: ['x86_64']
//             }
//         ]
//     };

//     const { InstanceTypes } = await awsEC2.describeInstanceTypes(params).promise();

//     const gpuInstanceDetails = InstanceTypes?.filter((it: any) => it.GpuInfo && it.GpuInfo.Gpus.length > 0)
//         .map((instance: any) => ({
//             InstanceType: instance.InstanceType,
//             CPU: {
//                 DefaultCores: instance.VCpuInfo.DefaultCores,
//                 DefaultThreadsPerCore: instance.VCpuInfo.DefaultThreadsPerCore,
//                 DefaultVCpus: instance.VCpuInfo.DefaultVCpus,
//                 SustainedClockSpeedInGHz: instance.ProcessorInfo.SustainedClockSpeedInGhz
//             },
//             GPU: instance.GpuInfo.Gpus.map((gpu: any) => ({
//                 Name: gpu.Name,
//                 Manufacturer: gpu.Manufacturer,
//                 Count: gpu.Count,
//                 MemoryMiB: gpu.MemoryInfo.SizeInMiB
//             })),
//             Network: {
//                 NetworkPerformance: instance.NetworkInfo.NetworkPerformance,
//                 MaximumNetworkCards: instance.NetworkInfo.MaximumNetworkCards,
//                 MaximumNetworkInterfaces: instance.NetworkInfo.MaximumNetworkInterfaces,
//                 IPv4AddressesPerInterface: instance.NetworkInfo.Ipv4AddressesPerInterface,
//                 IPv6AddressesPerInterface: instance.NetworkInfo.Ipv6AddressesPerInterface,
//                 IPv6Supported: instance.NetworkInfo.Ipv6Supported
//             }
//         }));

//     return gpuInstanceDetails


//     //   const gpuDetails = InstanceTypes?.map(instance => ({
//     //     InstanceType: instance.InstanceType,
//     //     GPUs: instance.GpuInfo?.Gpus.map(gpu => ({
//     //       Name: gpu.Name,
//     //       Manufacturer: gpu.Manufacturer,
//     //       Count: gpu.Count,
//     //       MemoryMiB: gpu.MemoryInfo?.SizeInMiB
//     //     })),
//     //     TotalGpuMemoryMiB: instance.GpuInfo?.TotalGpuMemoryInMiB
//     //   }));



// }