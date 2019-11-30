pragma solidity >=0.4.0;

// TODO: 암호화/복호화

contract PKI {
    
    address public owner;
    
    // mapping (uint => Entity) public entities;
    mapping (uint => Certificate) public registry;
    mapping (uint => Signature) public signings;
    mapping (uint => bool) public crl; // 인증서 폐기 목록 (Certificate Revocation Lists)
    // uint nEntities = 0;
    uint nCertificates = 0;
    uint nSignatures = 0;
    
    // 엔티티(개체)
    // struct Entity {
    //     address identity;
    //     uint level;
    // }

    // 인증서(공개키 키링으로 변환)
    struct Certificate {
        string data;
        string hash;
    }

    // 서명
    struct Signature {
        address owner;  // Owner of the signature
        uint certId;  // Id of the cerficate
        uint expiry;
        string sign;
    }
    
    // 사용자가 CA인지 판단해서 CA일 경우만 함수 실행
    modifier onlyOwner { require(msg.sender == owner); _; }

    constructor() public {
        owner = msg.sender;
    }
    
    // Add a trusted entity. Owner of the PKI only
    // 신뢰가능한 엔티티 추가. PKI 소유자 전용
    // function setCA(address trustedEntity) public returns (uint entityId) {
    //     if (msg.sender == owner) { // PKI 소유자 전용
    //         // 신뢰가능한 언티티 추가.
    //         entityId = nEntities++;
    //         entities[entityId] = Entity(trustedEntity, 1);
    //     } else {
    //         // 새로 추가하려는 엔티티가 entities 맵핑에 존재하는 경우에만 등록
    //         bool found = false;
    //         for (uint i=0; i < nEntities; i++) {
    //             if (msg.sender == entities[i].identity) {
    //                 entityId = nEntities++;
    //                 found = true;
    //                 entities[entityId] = Entity(trustedEntity, entities[i].level + 1);
    //             }
    //         }

    //         // 만약 found가 false 면 즉시 함수 종료후 모든 상태변환을 되돌림.
    //         require(found);
    //     }
    // }

    // A non trusted entity publishes its certificate
    // 신뢰 할 수 없는 엔티티가 자신의 인증서를 발행
    function append(string memory data, string memory hash) public returns (uint certId) {
        certId = nCertificates++;
        registry[certId] = Certificate(data, hash);
    }


    // A trusted entity signs a certificate (expiry is time in seconds)
    // 신뢰가능한 엔티티가 인증서에 서명 (expiry = 초 단위)
    function sign(uint certId, string memory _sign, uint expiry) public onlyOwner returns (uint signId) {
        // 서명을 signings 리스트에 추가
        signId = nSignatures++;
        signings[signId] = Signature(msg.sender, certId, now + expiry, _sign);
        // 인증서 폐기 여부를 false 로 설정 (사용가능한 인증서)
        crl[signId] = false;
    }

    // A trusted entity revokes a certificate
    // 신뢰가능한 엔티티가 인증서 취소 (인증서 폐기)
    function revoke(uint signId) public onlyOwner {
        crl[signId] = true;
    }

    // 서명 유효성 체크
    function isSignatureValid(uint signId) public view returns (bool state) {
        return !crl[signId] && now <= signings[signId].expiry;
    }
}