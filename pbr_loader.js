import * as THREE from "three";

export default class PBRLoader { 
    texture_loader = new THREE.TextureLoader();

    constructor(basic_path, extension) { 
        this.basic_path = basic_path;
        this.extension = extension;
    }

    async loadTexture() {
        this.albedo = await this.texture_loader.loadAsync("./" + this.basic_path + "albedo." + this.extension);  
        
        this.ao = await this.texture_loader.loadAsync("./" + this.basic_path + "ao." + this.extension);
        
        this.height = await this.texture_loader.loadAsync("./" + this.basic_path + "height." + this.extension);

        this.metallic = await this.texture_loader.loadAsync("./" + this.basic_path + "metallic." + this.extension);

        this.normal = await this.texture_loader.loadAsync("./" + this.basic_path + "normal-dx." + this.extension);  

        this.roughness = await this.texture_loader.loadAsync("./" + this.basic_path + "roughness." + this.extension);

    }
}